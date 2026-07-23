"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type ExtractResult = { added: string; previous: string } | null;

// The browser is the source of truth for a visitor's business context: it lives
// in localStorage and is sent to the server on each request. The server never
// stores it in a shared place, so nothing bleeds between visitors.
const STORAGE_KEY = "mb_business_context";

export function useMemory() {
  const [text, setTextState] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [working, setWorking] = useState<null | "save" | "scrape" | "upload">(null);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref in sync so async callbacks always send the latest context
  // without re-creating themselves on every keystroke.
  const textRef = useRef("");
  const setText = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    setTextState((prev) => {
      const next = typeof value === "function" ? (value as (p: string) => string)(prev) : value;
      textRef.current = next;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable / full: keep working in-memory */
      }
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    // Prefer the browser copy. Fall back to the server file once (local dev),
    // where it's a convenience; in production the server returns empty.
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored != null && stored.length > 0) {
        setText(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/marketing-brain/memory");
      const data = await res.json();
      if (data.text) setText(data.text);
    } catch {
      /* ignore */
    } finally {
      setLoaded(true);
    }
  }, [setText]);

  useEffect(() => {
    load().finally(() => setLoaded(true));
  }, [load]);

  const save = useCallback(
    async (next: string) => {
      setWorking("save");
      setError(null);
      try {
        setText(next);
      } finally {
        setWorking(null);
      }
    },
    [setText],
  );

  const scrape = useCallback(
    async (url: string) => {
      setWorking("scrape");
      setError(null);
      try {
        const res = await fetch("/api/marketing-brain/memory/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, businessContext: textRef.current }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError("couldn't read that site. check the URL.");
          return false;
        }
        setText(data.text ?? "");
        return true;
      } catch {
        setError("couldn't read that site. try again.");
        return false;
      } finally {
        setWorking(null);
      }
    },
    [setText],
  );

  const upload = useCallback(
    async (file: File) => {
      setWorking("upload");
      setError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("businessContext", textRef.current);
        const res = await fetch("/api/marketing-brain/memory/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            data?.error === "too_large"
              ? "that file is too big (max 15 MB)."
              : "couldn't read that file.",
          );
          return false;
        }
        setText(data.text ?? "");
        return true;
      } catch {
        setError("couldn't upload that file. try again.");
        return false;
      } finally {
        setWorking(null);
      }
    },
    [setText],
  );

  // Auto-capture a durable fact from a chat turn, appended to the CURRENT client
  // context (returns the added fact for an undo toast).
  const maybeExtract = useCallback(
    async (message: string): Promise<ExtractResult> => {
      try {
        const res = await fetch("/api/marketing-brain/memory/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, businessContext: textRef.current }),
        });
        const data = await res.json();
        if (data?.added) {
          setText((t) => data.text ?? t);
          return { added: data.added, previous: data.previous };
        }
      } catch {
        /* ignore */
      }
      return null;
    },
    [setText],
  );

  const hasContext = loaded && text.trim().length > 0;

  return {
    text,
    setText,
    loaded,
    working,
    error,
    hasContext,
    load,
    save,
    scrape,
    upload,
    maybeExtract,
  };
}
