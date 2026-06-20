// Local business-context "memory" for the Marketing Brain chat.
//
// Single-user, local-only MVP: one markdown file on disk, read/written via fs
// from Node-runtime routes. No database. Gitignored (personal business data).
// NOTE: this lives on the local filesystem — it will NOT persist on Vercel's
// ephemeral fs. That's intentional for the prototype; a durable store
// (SQLite / Vercel KV / Blob) is the later upgrade.

import fs from "fs";
import os from "os";
import path from "path";

// Where the memory file lives. Locally it sits in the repo root so it's easy to
// read/edit. On Vercel, process.cwd() (`/var/task`) is a read-only filesystem —
// only the OS temp dir (`/tmp`) is writable — so we base the path there instead.
// Storage on Vercel is per-instance and ephemeral (intentional for this MVP; a
// durable store is the later upgrade), but at minimum writes no longer crash.
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
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, text, "utf8");
}

// Append a clearly-delimited section; returns { previous, text } for undo support.
export function appendMemory(
  heading: string,
  body: string,
): { previous: string; text: string; added: string } {
  const previous = getMemory();
  const date = new Date().toISOString().slice(0, 10);
  const section = `## ${heading} — ${date}\n\n${body.trim()}\n`;
  const text = previous.trim() ? `${previous.trim()}\n\n${section}` : section;
  setMemory(text);
  return { previous, text, added: section };
}
