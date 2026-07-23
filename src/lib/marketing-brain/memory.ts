// Local business-context "memory" for the Marketing Brain chat.
//
// The CLIENT is the source of truth for a visitor's business context: it holds
// the text (localStorage) and sends it as `businessContext` on every request.
// The write endpoints (scrape / upload / extract) therefore append to the
// CLIENT-SENT context (see mergeSection) and return the merged result; they do
// not read a shared server file back to the visitor. That removes the
// cross-visitor data bleed a single global file would cause on a warm instance.
//
// The on-disk file below is a LOCAL-DEV convenience only (so the drawer can
// reload across restarts on your own machine). On Vercel process.cwd()
// (`/var/task`) is read-only and /tmp is per-instance + ephemeral, so it is not
// relied upon in production.

import fs from "fs";
import os from "os";
import path from "path";

const BASE = process.env.VERCEL ? os.tmpdir() : process.cwd();
const DIR = path.join(BASE, "marketing-brain-memory");
const FILE = path.join(DIR, "business-context.md");

// Soft cap so the injected context can't blow up the prompt. ~12k chars ≈ ~3k tokens.
export const MAX_CONTEXT_CHARS = 12000;

export function getMemory(): string {
  try {
    return fs.readFileSync(FILE, "utf8");
  } catch {
    return "";
  }
}

export function setMemory(text: string): void {
  // Never persist more than the cap: the injected context is bounded anyway, and
  // this stops an unbounded write from filling the (small) writable fs.
  const capped = text.slice(0, MAX_CONTEXT_CHARS);
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, capped, "utf8");
}

// Pure helper: append a clearly-delimited section to a base document and return
// the merged text (bounded to MAX_CONTEXT_CHARS) plus the section that was added.
// `date` is passed in so this stays a pure function (callers own the clock).
export function mergeSection(
  base: string,
  heading: string,
  body: string,
  date: string,
): { previous: string; text: string; added: string } {
  const previous = base ?? "";
  const section = `## ${heading} (${date})\n\n${body.trim()}\n`;
  const merged = previous.trim() ? `${previous.trim()}\n\n${section}` : section;
  const text = merged.slice(0, MAX_CONTEXT_CHARS);
  return { previous, text, added: section };
}

// Append a section against the local server file (LOCAL-DEV fallback only).
// Prefer mergeSection with the client-sent context in request handlers.
export function appendMemory(
  heading: string,
  body: string,
  base?: string,
): { previous: string; text: string; added: string } {
  const source = base ?? getMemory();
  const date = new Date().toISOString().slice(0, 10);
  const result = mergeSection(source, heading, body, date);
  setMemory(result.text);
  return result;
}
