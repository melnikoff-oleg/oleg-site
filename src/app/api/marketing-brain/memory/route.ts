import { getMemory, setMemory } from "@/lib/marketing-brain/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ text: getMemory() });
}

export async function PUT(req: Request) {
  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  setMemory(text);
  return Response.json({ ok: true, text });
}
