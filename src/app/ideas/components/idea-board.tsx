"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Idea } from "@/lib/ideas/db";
import { IdeaCard } from "./idea-card";
import { SubmitForm } from "./submit-form";

type Sort = "top" | "new";

export function IdeaBoard({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [voted, setVoted] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [highlight, setHighlight] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("top");
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ideas this browser voted on, unvoted or added since the page opened. The
  // server answered each of those actions with their state, which is newer
  // than the mount sync if that lands later, so the sync merges around them.
  const mine = useRef<Set<string>>(new Set());

  // The page arrives from the edge cache (see page.tsx): its list can be up to
  // a minute old and knows nothing about this browser. One read, right after
  // the board shows, brings both up to date: fresh counts, new ideas, and the
  // pressed state of every idea this browser has voted for.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/ideas", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ideas: Idea[]; voted: string[] } | null) => {
        if (!data) return;
        const own = mine.current;
        setIdeas((current) => {
          const kept = new Map(current.filter((i) => own.has(i.id)).map((i) => [i.id, i]));
          const fresh = data.ideas.map((i) => kept.get(i.id) ?? i);
          // One published here a moment ago may not be in the read yet.
          const added = [...kept.values()].filter((i) => !data.ideas.some((d) => d.id === i.id));
          return [...added, ...fresh];
        });
        setVoted((current) => {
          const next = new Set(data.voted.filter((id) => !own.has(id)));
          for (const id of own) if (current.has(id)) next.add(id);
          return next;
        });
      })
      .catch(() => {
        // Offline or aborted: the cached board stays, which is the point of it.
      });
    return () => ctrl.abort();
  }, []);

  const sorted = useMemo(() => {
    const copy = [...ideas];
    copy.sort((a, b) =>
      sort === "top"
        ? b.votes_count - a.votes_count ||
          +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(b.created_at) - +new Date(a.created_at),
    );
    return copy;
  }, [ideas, sort]);

  function flash(id: string, message?: string) {
    setHighlight(id);
    if (message) setNotice(message);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => {
      setHighlight(null);
      setNotice(null);
    }, 6000);
    // Deliberate, user-initiated scroll, so the site's smooth scrolling is right
    // here (unlike the filmed pages, where a programmatic scroll must be instant).
    requestAnimationFrame(() => {
      document.getElementById(`idea-${id}`)?.scrollIntoView({ block: "center" });
    });
  }

  async function vote(id: string) {
    if (pending.has(id)) return;
    mine.current.add(id);
    const wasVoted = voted.has(id);

    // Optimistic: the tap has to feel instant, the request catches up.
    setPending((p) => new Set(p).add(id));
    setVoted((v) => {
      const next = new Set(v);
      if (wasVoted) next.delete(id);
      else next.add(id);
      return next;
    });
    setIdeas((list) =>
      list.map((i) =>
        i.id === id ? { ...i, votes_count: i.votes_count + (wasVoted ? -1 : 1) } : i,
      ),
    );

    try {
      const res = await fetch("/api/ideas/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Roll the optimistic change back rather than leaving a number on screen
        // that the database does not agree with.
        setVoted((v) => {
          const next = new Set(v);
          if (wasVoted) next.add(id);
          else next.delete(id);
          return next;
        });
        setIdeas((list) =>
          list.map((i) =>
            i.id === id ? { ...i, votes_count: i.votes_count + (wasVoted ? 1 : -1) } : i,
          ),
        );
        setNotice(
          res.status === 429
            ? "That is a lot of voting for one day. Come back tomorrow."
            : "Could not save that vote. Try again in a moment.",
        );
        setTimeout(() => setNotice(null), 6000);
        return;
      }

      // Trust the server over the optimistic guess, for the count and for the
      // pressed state: a tap that landed before the mount sync could not know
      // this browser had already voted, and the server's toggle can.
      if (typeof data.votes === "number") {
        setIdeas((list) =>
          list.map((i) => (i.id === id ? { ...i, votes_count: data.votes } : i)),
        );
      }
      if (data.action === "voted" || data.action === "unvoted") {
        setVoted((v) => {
          const next = new Set(v);
          if (data.action === "voted") next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  }

  function onPublished(idea: Idea) {
    mine.current.add(idea.id);
    setIdeas((list) => [idea, ...list]);
    setVoted((v) => new Set(v).add(idea.id));
    flash(idea.id);
  }

  function onDuplicate(ideaId: string) {
    flash(ideaId, "Someone already suggested this. Vote for it here.");
  }

  return (
    <>
      <SubmitForm onPublished={onPublished} onDuplicate={onDuplicate} />

      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="eyebrow font-body text-[13px] text-vivid-blue">The board</h2>

        <div className="flex gap-1" role="group" aria-label="Sort ideas">
          {(["top", "new"] as Sort[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              aria-pressed={sort === option}
              className={cn(
                "min-h-[44px] rounded-full px-4 font-body text-sm transition-colors",
                sort === option
                  ? "bg-vivid-blue/15 text-white"
                  : "text-silver-muted hover:text-white",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-vivid-blue/30 bg-vivid-blue/10 px-4 py-3 font-body text-base text-silver"
        >
          {notice}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <p className="mt-6 font-body text-base text-silver-muted">
          Nothing on the board yet. Add the first one.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {sorted.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              voted={voted.has(idea.id)}
              pending={pending.has(idea.id)}
              highlighted={highlight === idea.id}
              onVote={vote}
            />
          ))}
        </ul>
      )}
    </>
  );
}
