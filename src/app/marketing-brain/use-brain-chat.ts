"use client";

import { useCallback, useRef, useState } from "react";
import type { Source, StreamFrame } from "@/lib/marketing-brain/types";

export type UiMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  streaming?: boolean;
  error?: boolean;
};

export function useBrainChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const busy = useRef(false);

  const send = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question || busy.current) return;
    busy.current = true;
    setIsStreaming(true);

    const history: UiMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    // user message + streaming assistant placeholder
    setMessages([
      ...history,
      { role: "assistant", content: "", sources: [], streaming: true },
    ]);

    const assistantIdx = history.length; // index of the placeholder

    const patch = (fn: (m: UiMessage) => UiMessage) =>
      setMessages((prev) =>
        prev.map((m, i) => (i === assistantIdx ? fn(m) : m)),
      );

    try {
      const res = await fetch("/api/marketing-brain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        patch((m) => ({
          ...m,
          streaming: false,
          error: true,
          content:
            data?.message ??
            "you've hit today's limit. reach out: oleg@buildauthority.ai",
        }));
        return;
      }

      if (!res.ok || !res.body) {
        patch((m) => ({
          ...m,
          streaming: false,
          error: true,
          content: "something went wrong. try again in a moment.",
        }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
          if (frame.type === "sources") {
            const sources: Source[] = frame.sources;
            patch((m) => ({ ...m, sources }));
          } else if (frame.type === "delta") {
            patch((m) => ({ ...m, content: m.content + frame.text }));
          } else if (frame.type === "error") {
            patch((m) => ({
              ...m,
              error: true,
              content: m.content || frame.message,
            }));
          }
        }
      }
    } catch {
      patch((m) => ({
        ...m,
        streaming: false,
        error: true,
        content: "something went wrong. try again in a moment.",
      }));
    } finally {
      patch((m) => ({ ...m, streaming: false }));
      setIsStreaming(false);
      busy.current = false;
    }
  }, [messages]);

  return { messages, isStreaming, send };
}
