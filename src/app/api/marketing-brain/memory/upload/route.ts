import { extractText, getDocumentProxy } from "unpdf";
import { distillBusinessProfile } from "@/lib/marketing-brain/distill";
import { appendMemory } from "@/lib/marketing-brain/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const DISTILL_OVER = 6000; // chars

export async function POST(req: Request) {
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
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
      const { text: extracted } = await extractText(pdf, { mergePages: true });
      text = Array.isArray(extracted) ? extracted.join("\n\n") : extracted;
    } else {
      text = new TextDecoder().decode(buf);
    }
  } catch (err) {
    console.error("[marketing-brain] upload extract error", err);
    return Response.json({ error: "extract_failed" }, { status: 422 });
  }

  text = text.trim();
  if (!text) return Response.json({ error: "empty_file" }, { status: 422 });

  try {
    // Distill long files; keep short ones verbatim.
    const body =
      text.length > DISTILL_OVER
        ? await distillBusinessProfile(text, `file: ${name}`)
        : text;
    const { previous, text: full } = appendMemory(`From file: ${name}`, body);
    return Response.json({ added: body, previous, text: full });
  } catch (err) {
    console.error("[marketing-brain] upload distill error", err);
    return Response.json({ error: "distill_failed" }, { status: 502 });
  }
}
