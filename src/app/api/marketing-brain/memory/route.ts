import { getMemory, setMemory } from "@/lib/marketing-brain/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The client owns its business context (localStorage) and sends it on each
// request, so GET is only a LOCAL-DEV convenience. On Vercel the server file
// lives in a per-instance /tmp shared by every visitor of that instance, so we
// never read it back to a visitor there (that would bleed one visitor's context
// to the next). Locally (single user) returning the file is fine and handy.
export async function GET() {
  const text = process.env.VERCEL ? "" : getMemory();
  return Response.json({ text });
}

export async function PUT(req: Request) {
  let text: string;
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  // setMemory caps the stored length, so an unbounded body can't fill the fs.
  setMemory(text);
  return Response.json({ ok: true, text });
}
