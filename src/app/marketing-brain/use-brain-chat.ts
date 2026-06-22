"use client";

import { useCallback, useRef, useState } from "react";
import type { Source, StreamFrame } from "@/lib/marketing-brain/types";

export type UiMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  streaming?: boolean;
  error?: boolean;
  // The model hit the length cap; the answer is incomplete but valid so far.
  // The UI offers a "continue" action.
  truncated?: boolean;
  // The stream ended without a clean finish (timeout / dropped connection); the
  // answer is incomplete. The UI offers a "try again" action.
  interrupted?: boolean;
};

const CHAT_URL = "/api/marketing-brain/chat";

// Read the NDJSON stream, dispatching frames to handlers. Returns the clean
// stop reason if a `done` frame arrived, or null if the stream ended without one
// (which means it was cut off — timeout, dropped connection, etc.).
async function consumeStream(
  body: ReadableStream<Uint8Array>,
  handlers: {
    onSources?: (s: Source[]) => void;
    onDelta?: (t: string) => void;
    onError?: (m: string) => void;
  },
): Promise<{ doneReason: string | null }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let doneReason: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let frame: StreamFrame;
      try {
        frame = JSON.parse(line);
      } catch {
        continue;
      }
      if (frame.type === "sources") handlers.onSources?.(frame.sources);
      else if (frame.type === "delta") handlers.onDelta?.(frame.text);
      else if (frame.type === "error") handlers.onError?.(frame.message);
      else if (frame.type === "done") doneReason = frame.reason;
    }
  }
  return { doneReason };
}

export function useBrainChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const busy = useRef(false);
  // Always-current snapshot, so retry/continue read fresh state without stale closures.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Stream an answer for `history` (whose last entry is the user turn to answer).
  // `apiMessages` overrides what's sent to the API (used by continue, which adds
  // a hidden "keep going" nudge); defaults to `history`. `targetIdx`/`append`
  // let continue stream into the existing (truncated) bubble instead of a new one.
  const stream = useCallback(
    async (
      history: UiMessage[],
      businessContext: string | undefined,
      opts?: { apiMessages?: UiMessage[]; targetIdx?: number; append?: boolean },
    ) => {
      busy.current = true;
      setIsStreaming(true);

      let assistantIdx: number;
      if (opts?.targetIdx !== undefined) {
        assistantIdx = opts.targetIdx;
        setMessages((prev) =>
          prev.map((m, i) =>
            i === assistantIdx
              ? { ...m, streaming: true, error: false, truncated: false, interrupted: false }
              : m,
          ),
        );
      } else {
        assistantIdx = history.length;
        setMessages([
          ...history,
          { role: "assistant", content: "", sources: [], streaming: true },
        ]);
      }

      const patch = (fn: (m: UiMessage) => UiMessage) =>
        setMessages((prev) => prev.map((m, i) => (i === assistantIdx ? fn(m) : m)));

      const apiMessages = (opts?.apiMessages ?? history).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let doneReason: string | null = null;
      let sawError = false;

      try {
        const res = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            businessContext: businessContext?.trim() || undefined,
          }),
        });

        if (res.status === 429) {
          const data = await res.json().catch(() => ({}));
          sawError = true;
          patch((m) => ({
            ...m,
            error: true,
            content:
              data?.message ??
              "you've hit today's limit. reach out on linkedin (linkedin.com/in/olegai).",
          }));
          return;
        }

        if (!res.ok || !res.body) {
          // Couldn't even start: treat as interrupted so the user gets a retry.
          patch((m) => ({ ...m, interrupted: true }));
          return;
        }

        const result = await consumeStream(res.body, {
          onSources: (sources) => {
            // Keep the original sources when continuing into an existing answer.
            if (!opts?.append) patch((m) => ({ ...m, sources }));
          },
          onDelta: (text) => patch((m) => ({ ...m, content: m.content + text })),
          onError: (message) => {
            sawError = true;
            patch((m) => ({ ...m, error: true, content: m.content || message }));
          },
        });
        doneReason = result.doneReason;
      } catch {
        // Network/stream dropped mid-flight: keep whatever streamed so far; the
        // finally block marks it interrupted (no clean done frame arrived).
      } finally {
        patch((m) => {
          const base = { ...m, streaming: false };
          if (sawError || m.error) return base; // refusal / rate limit / server error
          if (doneReason === "max_tokens") return { ...base, truncated: true };
          if (doneReason === null) return { ...base, interrupted: true };
          return base; // clean finish (end_turn / stop_sequence)
        });
        setIsStreaming(false);
        busy.current = false;
      }
    },
    [],
  );

  const send = useCallback(
    async (text: string, businessContext?: string) => {
      const question = text.trim();
      if (!question || busy.current) return;
      await stream(
        [...messagesRef.current, { role: "user", content: question }],
        businessContext,
      );
    },
    [stream],
  );

  // Re-answer the last question: drop the failed/incomplete assistant reply and
  // stream a fresh one in its place.
  const retry = useCallback(
    async (businessContext?: string) => {
      if (busy.current) return;
      const msgs = [...messagesRef.current];
      while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
      if (!msgs.length) return; // nothing to retry
      await stream(msgs, businessContext);
    },
    [stream],
  );

  // Extend a truncated answer in place: stream more text into the same bubble,
  // nudging the model (via a hidden user turn) to keep going without repeating.
  const continueLast = useCallback(
    async (businessContext?: string) => {
      if (busy.current) return;
      const msgs = messagesRef.current;
      const idx = msgs.length - 1;
      if (idx < 0 || msgs[idx].role !== "assistant" || !msgs[idx].content) return;
      // Add a space so the continuation doesn't glue onto the cut-off word.
      setMessages((prev) =>
        prev.map((m, i) =>
          i === idx && !/\s$/.test(m.content) ? { ...m, content: m.content + " " } : m,
        ),
      );
      const apiMessages: UiMessage[] = [
        ...msgs,
        {
          role: "user",
          content:
            "Continue your previous answer from exactly where it was cut off. Do not repeat anything you already wrote; just keep going and finish it.",
        },
      ];
      await stream(msgs, businessContext, {
        apiMessages,
        targetIdx: idx,
        append: true,
      });
    },
    [stream],
  );

  return { messages, isStreaming, send, retry, continueLast };
}
