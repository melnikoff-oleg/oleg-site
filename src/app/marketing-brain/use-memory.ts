"use client";

import { useCallback, useEffect, useState } from "react";

type ExtractResult = { added: string; previous: string } | null;

export function useMemory() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [working, setWorking] = useState<null | "save" | "scrape" | "upload">(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing-brain/memory");
      const data = await res.json();
      setText(data.text ?? "");
    } catch {
      /* ignore */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next: string) => {
    setWorking("save");
    setError(null);
    try {
      await fetch("/api/marketing-brain/memory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: next }),
      });
      setText(next);
    } catch {
      setError("couldn't save. try again.");
    } finally {
      setWorking(null);
    }
  }, []);

  const scrape = useCallback(async (url: string) => {
    setWorking("scrape");
    setError(null);
    try {
      const res = await fetch("/api/marketing-brain/memory/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "couldn't read that site. check the URL.");
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
  }, []);

  const upload = useCallback(async (file: File) => {
    setWorking("upload");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
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
  }, []);

  // Auto-capture a durable fact from a chat turn (returns the added fact for an undo toast).
  const maybeExtract = useCallback(async (message: string): Promise<ExtractResult> => {
    try {
      const res = await fetch("/api/marketing-brain/memory/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
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
  }, []);

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
