// POST /api/ai-interview-playbook/lead -> { email, role?, hires?, src?, step }
//
// Test capture for Anastasia Koroleva's lead magnet page (oleg.ae/ai-interview-playbook, 2026-11-18,
// Oleg: "deploy on oleg.ae just for the testing purposes"). Each step is saved as one JSON file in
// the private Storage bucket `vibe-coder-filter-leads` of the shared Boldane project (service-role
// key only, no public access). Built in the MS repo: projects/accounts/anastasia_koroleva/
// lead_magnet_2026-11-18 (tools/build_site.py writes the page, tools/read_leads.py lists the leads).
// When the page moves to quala.dev, this route goes away.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BUCKET = "vibe-coder-filter-leads";
const ROLES = new Set(["cto", "manager", "founder", "recruiter", "engineer", ""]);
const HIRES = new Set(["0", "1-2", "3-10", "10+", ""]);
const STEPS = new Set(["email", "qualify"]);

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Not set up." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const email = str(body.email, 200).toLowerCase();
  const role = str(body.role, 20);
  const hires = str(body.hires, 10);
  const src = str(body.src, 40).replace(/[^a-z0-9_-]/gi, "");
  const step = str(body.step, 20);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!ROLES.has(role) || !HIRES.has(hires) || !STEPS.has(step)) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, { bucket: "ai-interview-playbook", limit: 20 });
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests today." }, { status: 429 });

  const at = new Date().toISOString();
  const record = { email, role, hires, src: src || "direct", step, at, ip, user_agent: req.headers.get("user-agent") ?? "" };
  const path = `${at.slice(0, 10)}/${at.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}.json`;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.storage.from(BUCKET).upload(path, JSON.stringify(record), { contentType: "application/json" });
  if (error) return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
