# Plan: Fix Marketing Brain chat answer truncation + expandable input

**Created:** 2026-06-22
**Status:** Implemented
**Request:** The `/marketing-brain` chat (1) truncates answers mid-sentence with a hard stop, (2) has a query input box that doesn't grow for multi-line input like ChatGPT does, and (3) never surfaces the Cialdini book ("Influence: The Psychology of Persuasion") in results, even when asked about it directly.

---

## Overview

### What This Plan Accomplishes

Three fixes to the `$1B Marketing Brain` chat (`/marketing-brain`):

1. **Answers no longer get cut off mid-sentence.** Root cause: the chat route sets `max_tokens: 3000` while adaptive thinking is on, so the model's thinking tokens eat into the same 3000-token budget and the visible answer is truncated when it hits the cap (`stop_reason: "max_tokens"`), with no signal to the user. We raise the budget so a full answer always fits, and add explicit `max_tokens` handling so a truncation can never again fail silently.
2. **The composer input grows with its content.** The `<textarea>` is fixed at one row and never auto-resizes, so a long or multi-line question scrolls inside a one-line box. We make it auto-grow up to a cap (then scroll), ChatGPT-style, and shrink back after send.
3. **The Cialdini book surfaces in results.** Root cause is two compounding retrieval flaws (the book is in the corpus with 702 chunks and is *not* broken): (a) the BM25 index tokenizes only each chunk's body `text`, so a book's identity (title "Influence: The Psychology of Persuasion", author "Robert Cialdini") is invisible to search; and (b) there is no per-source diversity, so the ~357 Cialdini *video* transcript chunks (short and term-dense) consistently outrank the book's prose. For "persuasion principles cialdini" the book got **0 of 8** result slots, all 8 being Cialdini videos. We fold each chunk's identity into the indexed tokens and add a per-source cap so the book reliably surfaces.

### Why This Matters

The Marketing Brain is the site's flagship free lead magnet and the live demo of "AI systems for marketing." A visibly broken answer (cut off mid-thought) and a cramped input box both undercut the premium impression the page is built to create. And a corpus that advertises 8 books but silently drops one of the most famous (Cialdini's *Influence*) from every answer makes the "grounded in the greatest marketing minds" promise ring hollow. All three are small, contained fixes with outsized polish impact.

---

## Current State

### Relevant Existing Structure

- `src/app/api/marketing-brain/chat/route.ts` — the serverless Route Handler. Streams NDJSON: a `sources` frame, then `delta` text frames. Uses `@anthropic-ai/sdk`, `model = "claude-sonnet-4-6"`, `max_tokens: 3000`, `thinking: { type: "adaptive" }`, `maxDuration = 30`. After the stream it inspects `final.stop_reason` but only handles `"refusal"`.
- `src/app/marketing-brain/page.tsx` — the chat UI. The composer is a `<form>` (lines ~212-242) containing a `<textarea rows={1}>` with `className="max-h-40 flex-1 resize-none …"` and no auto-grow logic. `input`/`setInput` state lives here; `submit()` calls `setInput("")` after sending.
- `src/app/marketing-brain/use-brain-chat.ts` — the `useBrainChat` hook. Reads NDJSON frames and patches the streaming assistant message. Handles `sources`, `delta`, `error` frames; no notion of a truncation/continue signal.
- `src/lib/marketing-brain/types.ts` — `StreamFrame` union: `sources | delta | error`.
- `src/lib/marketing-brain/retriever.ts` — the BM25 index + `search()`. `load()` tokenizes only `chunk.text` (line 65: `tok(chunk.text)`). `search()` scores candidates and returns the top `k` chunks with no per-source diversity constraint.
- `src/app/marketing-brain/_data/chunks.json` — the server-only corpus (10,194 chunks). Book chunks carry `slug`, `title`, `author`; video chunks carry `videoId`, `title`, `expert`. **The Cialdini book is present (702 chunks, cover and gallery entry both exist) — it is purely a ranking/recall problem, not missing data.**
- `marketing-brain/scripts/query.py` — the offline Python CLI the retriever is a "faithful port" of. Tokenizes only `text` (lines 63, 79). Must be kept in parity. `marketing-brain/scripts/build-web-index.py` already stores `title`/`author`/`expert` on every chunk, so **no corpus rebuild is required** for the fix.

### Gaps or Problems Being Addressed

1. **Truncation:** With adaptive thinking enabled, thinking tokens are drawn from `max_tokens`. At `max_tokens: 3000`, a normal-length answer plus the model's thinking can exceed 3000, so the answer is cut off (`stop_reason: "max_tokens"`). The route never checks for `"max_tokens"`, so the client just stops receiving deltas and the UI shows a sentence that ends abruptly. The example the user reported ("…so a cleaner math-style breakdown might") is exactly this failure.
2. **Input box:** `rows={1}` + `resize-none` + no JS auto-grow means the textarea height is locked to one line. `max-h-40` only caps a height that never changes, so multi-line input scrolls inside a single visible row instead of the box expanding.
3. **Cialdini book never surfaces (verified by reproducing the BM25 ranking):**
   - **(a) Identity not indexed.** Only `chunk.text` is tokenized. The book's title and author aren't searchable, so "the book Influence by Cialdini" matches only the literal words where they happen to appear in body prose, diluted across all 8 books and the videos.
   - **(b) Videos crowd out the book.** The corpus has 357 Cialdini *video* chunks (transcript paragraphs: short, high term-density) competing with the 702 book chunks. BM25 length-normalization favors the short dense video chunks. Measured top-8 for Cialdini queries: "cialdini influence" → 1 book / 7 video; "persuasion principles cialdini" → **0 book / 8 video**; "what does Influence by Cialdini say about reciprocity" → 1 book / 7 video. The book is effectively invisible whenever same-author videos exist.

---

## Proposed Changes

### Summary of Changes

- Raise `max_tokens` in the chat route from `3000` to `8000` (streaming, so no HTTP-timeout concern) so thinking + a full answer comfortably fit.
- Add explicit `stop_reason === "max_tokens"` handling in the route as a safety net: if the model ever still hits the cap, append a short, clean continuation notice instead of a silent mid-word stop.
- Make the composer `<textarea>` auto-resize to its content (up to `max-h-40`, then scroll), and reset its height after the input is cleared on submit.
- Fold each chunk's identity (book: title + author; video: title + expert) into the tokens the BM25 index sees, so a book/video is matchable by its name and creator.
- Add a per-source diversity cap to `search()` (over-fetch, then take top-`k` allowing at most ~2 chunks per unique source) so one talk (or videos generally) can't fill every slot and the relevant book can surface.
- Mirror the identity-indexing change in `marketing-brain/scripts/query.py` to keep the documented "faithful port" parity (no corpus rebuild needed).

### New Files to Create

None.

### Files to Modify

| File Path | Changes |
| --- | --- |
| `src/app/api/marketing-brain/chat/route.ts` | Bump `max_tokens` 3000 → 8000; handle `stop_reason === "max_tokens"` by emitting a graceful notice frame. |
| `src/app/marketing-brain/page.tsx` | Add a `textareaRef` + auto-resize handler on the composer textarea; reset height on submit. |
| `src/lib/marketing-brain/retriever.ts` | Tokenize chunk identity (title + author/expert) alongside body text in `load()`; add a per-source diversity cap in `search()`. |
| `marketing-brain/scripts/query.py` | Parity: tokenize identity alongside body text (offline CLI; not on the request path). |

### Files to Delete (if any)

None.

---

## Design Decisions

### Key Decisions Made

1. **Raise `max_tokens` rather than disable thinking.** Adaptive thinking improves answer quality for reasoning-style marketing questions, and the route already streams (so the usual high-`max_tokens` HTTP-timeout caveat does not apply). `8000` gives generous room for thinking plus a complete, skimmable answer while staying well within the model's 64K streaming ceiling and the 30s function budget. This is the root-cause fix; the example answer was only ~250 words, so the cap, not the content, was the limiter.
2. **Keep `claude-sonnet-4-6`.** It is the right cost/latency tier for a free, rate-limited public chat and is the model documented across CLAUDE.md and `context/integrations.md`. No model change is warranted; the bug is purely the token budget. (Per the Claude API guidance, adaptive thinking on Sonnet 4.6 draws thinking tokens from `max_tokens`, which is the mechanism behind the truncation.)
3. **Treat `max_tokens` as a handled stop reason, not just `refusal`.** Even with a higher budget, an unusually long answer could theoretically hit the cap. Emitting a brief, lowercase notice ("…(answer was long, ask me to continue)") converts a silent broken-sentence into an honest, recoverable state. Reuses the existing `error`-style frame path so no client changes are required.
4. **Auto-resize the textarea in the existing component, no new dependency.** A few lines of ref + `style.height` logic match the lean, dependency-light style of the page. Cap stays at the existing `max-h-40` (10rem); past that it scrolls, exactly like ChatGPT.
5. **Reset textarea height on submit.** Because `submit()` clears `input`, the height must be reset to one row in the same flow, or the box would stay tall after sending.
6. **Fix book recall with two general levers, not a Cialdini-specific hack.** Indexing identity (title/author/expert) and capping chunks-per-source are corpus-wide quality improvements that help every under-surfaced book, not just Cialdini. Validated by simulation: with both changes the Cialdini book enters the top 8 for every tested query (including the previously 0/8 "persuasion principles cialdini", where it now ranks #4–5). Identity indexing makes the book matchable by name; the per-source cap stops near-duplicate same-author videos from monopolizing the slots.
7. **No corpus rebuild; keep `query.py` in parity.** `build-web-index.py` already stores `title`/`author`/`expert` on each chunk, so the identity tokens can be assembled at index time inside `retriever.load()` from existing fields — `chunks.json` is untouched. `query.py` is updated in lockstep purely to honor the "faithful port" note in `retriever.ts`; it is an offline tool, never on the serverless path.
8. **Per-source cap of ~2 (not 1).** Allowing two chunks per source preserves enough depth for the model to ground a claim from a single strong source while still guaranteeing diversity. A cap of 1 would over-fragment grounding; no cap is the current broken behavior.

### Alternatives Considered

- **Lower `effort` / disable thinking to free up budget** — rejected: it trades answer quality for a budget problem better solved by raising the budget. Disabling thinking would also change the answer character noticeably.
- **A dedicated `truncated` stream-frame type + a "Continue" button in the UI** — deferred: more surface area (new `StreamFrame` variant in `types.ts`, hook handling, a button, and a follow-up request that resends history). The higher `max_tokens` makes real truncation rare; the graceful notice covers the edge case. Can be added later if telemetry shows truncations still happen.
- **A CSS-only `field-sizing: content` textarea** — rejected: browser support is still uneven (notably older Safari), and the project targets a polished cross-browser experience. The JS approach is reliable everywhere.
- **Boosting book chunks with a flat score multiplier over videos** — rejected: a blunt thumb-on-the-scale that would distort ranking for questions genuinely best answered by a talk. The per-source cap achieves diversity without biasing book-vs-video relevance.
- **Re-chunking the corpus / merging video chunks** — rejected: a large data-regeneration effort for a problem solvable at index/query time. The two retriever-level levers fix recall without touching `chunks.json`.
- **Adding a new searchable field at build time (`build-web-index.py`)** — deferred: assembling identity tokens in `retriever.load()` from fields already present avoids a corpus rebuild and a chunks.json size bump; equivalent effect.

### Open Questions (if any)

None blocking. (Optional, owner's call: whether to also bump `maxDuration` from 30 to 60 for extra headroom on long answers. Not required — Sonnet is fast and 8000 tokens streams well under 30s — so this plan leaves it at 30 unless the user wants the change.)

---

## Step-by-Step Tasks

### Step 1: Raise the token budget and handle the `max_tokens` stop reason

In `src/app/api/marketing-brain/chat/route.ts`:

**Actions:**

- Change `max_tokens: 3000` to `max_tokens: 8000` in the `client.messages.stream({ … })` call.
- Extend the post-stream `final.stop_reason` check (currently only `"refusal"`) to also handle `"max_tokens"`. On `"max_tokens"`, emit a short continuation notice as a delta so the answer doesn't end on a broken word. Keep the existing `"refusal"` branch.

Concretely, replace the existing block:

```ts
const final = await llm.finalMessage();
if (final.stop_reason === "refusal") {
  send(controller, {
    type: "error",
    message: "i can't answer that one. try rephrasing.",
  });
}
```

with:

```ts
const final = await llm.finalMessage();
if (final.stop_reason === "refusal") {
  send(controller, {
    type: "error",
    message: "i can't answer that one. try rephrasing.",
  });
} else if (final.stop_reason === "max_tokens") {
  // Safety net: the answer ran past the budget. Don't leave it on a broken
  // word. Append a short, honest note (the higher max_tokens makes this rare).
  send(controller, {
    type: "delta",
    text: "\n\n(that answer ran long, ask me to continue and i'll pick up where i left off.)",
  });
}
```

**Files affected:**

- `src/app/api/marketing-brain/chat/route.ts`

---

### Step 2: Make the composer textarea auto-resize

In `src/app/marketing-brain/page.tsx`:

**Actions:**

- Add a ref for the textarea near the other refs: `const textareaRef = useRef<HTMLTextAreaElement>(null);` (`useRef` is already imported).
- Add a helper that resizes the textarea to its content height, capped, and an effect/handler to call it as the value changes. The cleanest approach: a `resize` function that sets `height = "auto"` then `height = scrollHeight + "px"`, and call it from the textarea's `onChange` (right after `setInput`). Also call it once after submit to reset.

Add this helper inside the component (above `submit`):

```ts
const resizeTextarea = () => {
  const el = textareaRef.current;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
};
```

- In `submit`, after `setInput("")`, reset the height so the box shrinks back to one row:

```ts
setInput("");
// shrink the composer back to one line after sending
requestAnimationFrame(() => {
  const el = textareaRef.current;
  if (el) el.style.height = "auto";
});
```

- Wire the textarea up:

```tsx
<textarea
  ref={textareaRef}
  value={input}
  onChange={(e) => {
    setInput(e.target.value);
    resizeTextarea();
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }}
  rows={1}
  placeholder="ask the brain…"
  className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
/>
```

Notes:
- Add `overflow-y-auto` so once content passes `max-h-40` the textarea scrolls instead of overflowing the form.
- `rows={1}` stays as the minimum/initial height; the JS grows it from there.
- Shift+Enter already inserts a newline (the existing `onKeyDown` only submits on Enter without Shift), so multi-line entry already works once the box can grow.

**Files affected:**

- `src/app/marketing-brain/page.tsx`

---

### Step 3: Surface the Cialdini book (and improve recall corpus-wide)

In `src/lib/marketing-brain/retriever.ts`:

**Actions:**

- **Index identity.** In `load()`, build the token source from the chunk's identity plus its body, instead of `chunk.text` alone. Add a small helper and use it in the `chunks.forEach` loop:

```ts
function indexText(chunk: Chunk): string {
  // Fold identity into the searchable text so a book/video is matchable by its
  // name and creator (e.g. "Influence" / "Cialdini"), not only by body prose.
  if (chunk.type === "book") {
    return `${chunk.title} ${chunk.author} ${chunk.text}`;
  }
  return `${chunk.title} ${chunk.expert} ${chunk.text}`;
}
```

  Then change the loop's first line from `const tokens = tok(chunk.text);` to `const tokens = tok(indexText(chunk));`. (`tf`, `df`, `inv`, `avgdl` all derive from `tokens`, so identity terms now participate in scoring automatically.)

- **Add a per-source diversity cap** in `search()`. Add a source-key helper:

```ts
function sourceKey(c: Chunk): string {
  return c.type === "book" ? c.slug : c.videoId;
}
```

  Then replace the final return — over-fetch by score, then take the top `k` allowing at most `PER_SOURCE` (= 2) chunks per source key:

```ts
const PER_SOURCE = 2;
scored.sort((a, b) => b.score - a.score);

const out: Chunk[] = [];
const perKey = new Map<string, number>();
for (const { i } of scored) {
  const chunk = idx.docs[i].chunk;
  const key = sourceKey(chunk);
  const used = perKey.get(key) ?? 0;
  if (used >= PER_SOURCE) continue;
  perKey.set(key, used + 1);
  out.push(chunk);
  if (out.length >= k) break;
}
return out;
```

  This replaces the existing `return scored.slice(0, k).map(...)`. Because `search()` is called with `k = 8` in the route, the model still gets 8 grounding chunks, now drawn from more distinct sources.

**Parity:** In `marketing-brain/scripts/query.py`, mirror the identity-indexing change so the offline CLI stays a faithful match. At the two `tok(...)` call sites that build chunk tokens (≈ lines 63 and 79), tokenize identity + text:
- Book (line ~63): `"tokens": tok(f"{title} {author} {ch}")`
- Video (line ~79): `"tokens": tok(f"{title} {expert} {text}")`

(The per-source cap is a serving-time concern for the web chat; replicating it in the CLI is optional and not required for parity of the index itself. Note it in a comment if skipped.)

**No corpus rebuild is needed** — `chunks.json` already contains `title`/`author`/`expert`; the identity tokens are assembled in-memory at index load.

**Files affected:**

- `src/lib/marketing-brain/retriever.ts`
- `marketing-brain/scripts/query.py`

---

### Step 4: Validate locally

**Actions:**

- Run `npm run dev` and open `http://localhost:3000/marketing-brain`.
- Ask a reasoning-style question similar to the reported one (e.g. "is hooks a discipline or a technique? break down copywriting, storytelling, branding, persuasion, public speaking, research, production"). Confirm the answer now completes with a natural ending and no mid-sentence cutoff.
- Paste a long multi-line prompt into the input and confirm the box grows as you type / add lines, caps at ~10rem then scrolls, and shrinks back to one line after sending.
- Confirm Shift+Enter adds a newline and Enter sends.
- **Cialdini book:** ask several Cialdini/persuasion questions (e.g. "what does the book Influence by Cialdini say about reciprocity", "persuasion principles cialdini", "reciprocity scarcity authority social proof commitment") and confirm a **book** source card for *Influence: The Psychology of Persuasion* (cover + page) now appears among the sources, not only video cards. Also confirm unrelated queries still return sensible, diverse sources (no regression).
- Run `npm run build` to confirm a clean production build (no type errors from the ref/handler/retriever changes).

**Files affected:**

- None (verification only).

---

## Connections & Dependencies

### Files That Reference This Area

- `use-brain-chat.ts` consumes the route's NDJSON frames. The Step 1 change reuses the existing `delta` and `error` frame types, so **no hook change is needed**. The graceful-truncation notice arrives as an ordinary `delta` and renders inline.
- `src/lib/marketing-brain/types.ts` (`StreamFrame`) is unchanged — we deliberately avoid adding a new frame variant.

### Updates Needed for Consistency

- None required. CLAUDE.md already documents `claude-sonnet-4-6`; the model is unchanged. `max_tokens` is an implementation detail not pinned in CLAUDE.md or `context/integrations.md` (integrations.md says `max_tokens` 3000 in its Anthropic note — optionally update that line to 8000 to keep the note accurate, but it is non-load-bearing).

### Impact on Existing Workflows

- No API surface change, no new env vars, no new dependencies. Slightly higher per-answer token usage (bounded by the per-IP daily cap of 30), which is acceptable for a complete, non-truncated answer.
- The retrieval change affects only ranking/selection of grounding chunks; `Source`/`GroupedSource` shapes, the NDJSON protocol, and the UI source-card rendering are unchanged. `chunks.json` is not modified, so `outputFileTracingIncludes` and the Vercel function bundle are unaffected.
- `query.py` is an offline developer tool; its parity edit has no runtime impact on the site.

---

## Validation Checklist

- [ ] `max_tokens` is `8000` in `route.ts`.
- [ ] Route handles `stop_reason === "max_tokens"` with a graceful continuation notice (in addition to the existing `refusal` handling).
- [ ] A previously-truncating reasoning question now returns a complete answer ending on a full sentence.
- [ ] The composer textarea grows with multi-line / long input, caps at `max-h-40`, then scrolls.
- [ ] The textarea shrinks back to a single row after a message is sent.
- [ ] Shift+Enter inserts a newline; Enter submits.
- [ ] `retriever.ts` tokenizes identity (title + author/expert) in `load()`, and `search()` enforces the per-source cap.
- [ ] A book card for Cialdini's *Influence* appears in the sources for direct Cialdini/persuasion questions.
- [ ] `query.py` identity-indexing change applied for parity.
- [ ] Unrelated queries still return diverse, sensible sources (no regression).
- [ ] `npm run build` succeeds with no type errors.

---

## Success Criteria

1. Answers in `/marketing-brain` consistently finish on a natural sentence boundary; no more hard mid-sentence stops for normal-length questions.
2. In the rare case the budget is still exceeded, the user sees an honest, lowercase "ask me to continue" note instead of a broken word.
3. The query input behaves like ChatGPT's: it expands as the user types more lines (up to a cap, then scrolls) and resets after sending.
4. The Cialdini book *Influence: The Psychology of Persuasion* surfaces as a source card for Cialdini/persuasion questions (previously 0/8 slots), and retrieval generally returns more diverse sources without regressing unrelated queries.

---

## Notes

- **Why 8000 and not higher:** It is generous headroom for adaptive thinking plus a complete, skimmable answer, while keeping latency and per-answer cost reasonable for a free, rate-limited public endpoint, and staying comfortably inside the 30s `maxDuration`. If long-form answers become a feature goal later, raising to 12000–16000 is safe (still streaming) and may pair well with bumping `maxDuration` to 60.
- **Future enhancement (deferred):** a first-class "Continue" affordance — a `truncated` `StreamFrame` variant + a one-tap button in the UI that resends the conversation to extend the answer. Only worth building if truncations recur after the budget bump.
- **Root-cause reference (truncation):** per Anthropic's API guidance, with adaptive thinking the model's thinking tokens are drawn from the same `max_tokens` budget as the visible answer, and hitting that budget yields `stop_reason: "max_tokens"` with the output cut off — exactly the reported symptom.
- **Cialdini investigation evidence:** confirmed the book is fully present (702 chunks, cover at `public/marketing-brain/book-covers/cialdini-influence.jpg`, gallery entry in `data.ts`) — so it was never a data problem. Reproduced the live BM25 ranking: the book scored but was buried under Cialdini video chunks (e.g. 0/8 book slots for "persuasion principles cialdini"). Simulated the proposed fix (identity indexing + per-source cap = 2): the book then entered the top 8 for every Cialdini query tested, ranking #4–5 on the previously-failing one.
- **Per-source cap tuning (future):** if videos still feel over-represented for book-centric questions, options include lowering the cap to 1 for videos only, or guaranteeing at least one book slot when a same-topic book exists. Not needed to resolve the reported issue; revisit only if telemetry/feedback warrants.

---

## Implementation Notes

**Implemented:** 2026-06-22

### Summary

- **Truncation:** `route.ts` `max_tokens` 3000 → 8000; added `stop_reason === "max_tokens"` handling that appends a graceful "ask me to continue" note as a delta.
- **Composer input:** `page.tsx` textarea now auto-resizes to content (ref + `resizeTextarea` on change, `overflow-y-auto`, capped by `max-h-40`), and resets to one row on submit.
- **Cialdini book recall:** `retriever.ts` now folds chunk identity (book title+author / video title+expert) into the indexed tokens, caps results at `PER_SOURCE = 2` chunks per book/video, and applies a `BOOK_WEIGHT = 1.25` quality bonus to book scores. `query.py` updated in parity (identity indexing + book weight).

### Deviations from Plan

- **Added a book quality weight (`BOOK_WEIGHT = 1.25`)** beyond the planned identity-indexing + per-source cap. Rationale: at the user's request, sources are now scored by quality (a book is years of distilled, edited thinking vs a single talk). It was also necessary — testing surfaced one Cialdini question ("what Cialdini says about *liking* vs rapport") where the book still lost all 8 slots to distinct Cialdini videos under the cap alone. The weight was tuned by simulation: 1.25 surfaces the relevant book while leaving genuinely video-only topics (MrBeast thumbnails, YouTube growth) video-led, because the bonus only tips the balance when a relevant book exists. Mirrored in `query.py`.
- The `query.py` parity now also includes the book quality weight (the plan had only specified identity indexing for parity).

### Issues Encountered

- **First 20-test run: 19/20.** The "liking vs rapport" Cialdini question returned 8 video sources, no book. Resolved by adding the quality weight (above); the re-run after restarting the dev server passed 20/20 with the Cialdini book surfaced 10/10.
- **Browser test path:** the Chrome extension wasn't connected, so the composer fix was tested with a transient `playwright-core --no-save` install driving the locally-cached Chromium headlessly (real layout + real keystrokes). 8/8 passed.

### Test Evidence

- `scripts/test-marketing-brain-fixes.mjs` — 20 real API tests against the running dev server (10 Cialdini/persuasion + 10 deep-topic, all long-answer). Result: **20/20 pass**, Cialdini book surfaced **10/10**, every answer completed on a sentence boundary (1.5K–6.8K chars), no truncation sentinel.
- `scripts/test-composer-resize.mjs` — 8 real headless-Chromium DOM tests of the input box. Result: **8/8 pass** (empty 39px → multi-line 151px → caps 160px, Shift+Enter newlines, overflow scrolls, resets on clear).

---

## Follow-up: Clear incomplete-answer communication (2026-06-22)

User feedback after the first pass: when an answer stops mid-sentence it's not clear whether the model cut it, the length cap hit, or the server bugged. The original inline parenthetical note was easy to miss and ambiguous. Replaced it with a real completion protocol + distinct UI.

**Changes**
- **Protocol:** added a `done` frame (`{ type: "done"; reason }`) to `StreamFrame` (`types.ts`). The route (`route.ts`) now always emits `done` last with the Anthropic `stop_reason`, and `maxDuration` raised 30 → 60s to make timeout-kills rarer. The inline "ran long" note was removed.
- **Client (`use-brain-chat.ts`):** the hook now distinguishes three end states — clean finish (done reason `end_turn`/etc.), `truncated` (done reason `max_tokens`), and `interrupted` (stream ended with **no** `done` frame = timeout/dropped connection). Partial text is preserved on a drop (the old catch overwrote it with a generic error). Added `retry()` (re-answers the last question in place) and `continueLast()` (extends a truncated answer in the same bubble via a hidden "keep going" nudge).
- **UI (`chat-message.tsx` + `page.tsx`):** truncated → amber banner "this answer hit the length limit…" + **continue the answer**; interrupted → red banner "…cut off before it finished, the connection dropped or timed out. it wasn't you." + **try again**. Buttons render only on the latest message.

**Tests (all real environment)**
- `scripts/test-completion-ux.mjs` — Playwright drives the real page with network interception forcing each end state. **5/5 pass**: clean→no banner; max_tokens→amber banner + continue extends same answer; no-done→red banner + retry replaces.
- Real route contract check: a live (non-mocked) call emits exactly one `done` frame, reason `end_turn`, as the last frame. **PASS**.
- Regression: 20-question suite **20/20** (Cialdini 10/10) and composer **8/8** still pass.

---

## Follow-up: Per-source quality scoring + relevance-first ranking (2026-06-22)

User direction: rate every data point 1-10 and let value propel higher-value sources; books are worth ~5x a video; rate every video individually (views matter); then "think through 20 scenarios, define the best answer, and reverse-engineer how to achieve it."

**Scoring**
- `marketing-brain/scripts/build-quality-scores.py` generates `src/lib/marketing-brain/quality-scores.json`: 8 books scored 8-10 (authority/timelessness rubric) and all 75 videos scored 2-7 individually, anchored on real view counts (log scale) + a small long-form depth bump. (Every video md carries `views`/`duration`.)

**Ranking model (reverse-engineered, not guessed)**
- `marketing-brain/scripts/sim-ranking-policies.py` defines 20 diverse scenarios (book-topic, video-native, mixed, source-specific), each with an ideal-mix check, and scores candidate policies.
- Finding: a flat multiplicative "books Nx videos" caps at ~14/20 because it fights relevance — weakly-matching books hijack video-native topics (a generic offers book leading a "MrBeast thumbnails" question). Pure 5x = 9/20.
- Winner (19/20): **additive** `final = BM25/maxBM25 + BETA*qualityPrior` with `BETA=0.35`, book prior 0.90-1.00, video prior 0.00-0.40 (view-graded), per-source cap 2, and a guaranteed `RESERVE_VIDEOS=2`. Books lead timeless/principle/mixed topics; the best video leads platform/format topics (YouTube, thumbnails, SEO, short-form); blends on mixed; named sources always present. The single miss ("grow on social media right now" led by a Gary video not his book) is a defensible near-call.
- Implemented in `retriever.ts` (replaces the earlier multiplicative `BOOK_WEIGHT`); `query.py` updated in parity (additive scoring + cap + reserve).

**Tests (real environment):** 20-question live suite **20/20** (Cialdini 10/10, all answers complete); `query.py` smoke-test confirms MrBeast-thumbnails now leads with MrBeast videos (was Hormozi books); build clean.
