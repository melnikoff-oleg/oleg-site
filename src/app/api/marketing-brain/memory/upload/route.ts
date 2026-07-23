import { extractText, getDocumentProxy } from "unpdf";
import { distillBusinessProfile } from "@/lib/marketing-brain/distill";
import { mergeSection, MAX_CONTEXT_CHARS } from "@/lib/marketing-brain/memory";
import {
  checkRateLimit,
  getClientIp,
  MEMORY_DAILY_LIMIT,
} from "@/lib/marketing-brain/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_PDF_PAGES = 100; // bound parse work against crafted PDFs
const MAX_EXTRACT_CHARS = 200_000; // hard cap on extracted text before distill
const DISTILL_OVER = 6000; // chars

export async function POST(req: Request) {
  if (!checkRateLimit(getClientIp(req), { bucket: "memory", limit: MEMORY_DAILY_LIMIT }).allowed) {
    return Response.json({ error: "rate_limit" }, { status: 429 });
  }

  let file: File | null = null;
  let base = "";
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
    const ctx = form.get("businessContext");
    if (typeof ctx === "string") base = ctx.slice(0, MAX_CONTEXT_CHARS);
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!file) return Response.json({ error: "missing_file" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  const name = file.name || "upload";
  const isPdf = name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";

  let text = "";
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    if (isPdf) {
      const pdf = await getDocumentProxy(buf);
      if (pdf.numPages > MAX_PDF_PAGES) {
        return Response.json({ error: "too_large" }, { status: 413 });
      }
      const { text: extracted } = await extractText(pdf, { mergePages: true });
      text = Array.isArray(extracted) ? extracted.join("\n\n") : extracted;
    } else {
      text = new TextDecoder().decode(buf);
    }
  } catch (err) {
    console.error("[marketing-brain] upload extract error", err);
    return Response.json({ error: "extract_failed" }, { status: 422 });
  }

  text = text.trim().slice(0, MAX_EXTRACT_CHARS);
  if (!text) return Response.json({ error: "empty_file" }, { status: 422 });

  try {
    // Distill long files; keep short ones verbatim.
    const body =
      text.length > DISTILL_OVER
        ? await distillBusinessProfile(text, `file: ${name}`)
        : text;
    const date = new Date().toISOString().slice(0, 10);
    const { previous, text: full } = mergeSection(base, `From file: ${name}`, body, date);
    return Response.json({ added: body, previous, text: full });
  } catch (err) {
    console.error("[marketing-brain] upload distill error", err);
    return Response.json({ error: "distill_failed" }, { status: 502 });
  }
}
