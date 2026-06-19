// Claude helpers for the business-context memory: distill raw scrapes/files into
// a concise business profile, and extract durable facts from chat turns.
// All use claude-sonnet-4-6 (per project decision).

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

function client() {
  return new Anthropic();
}

async function complete(system: string, user: string, maxTokens: number): Promise<string> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "disabled" },
    system,
    messages: [{ role: "user", content: user }],
  });
  return msg.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

// Turn a raw website scrape or long file into a tight, high-signal profile.
export async function distillBusinessProfile(
  raw: string,
  sourceLabel: string,
): Promise<string> {
  const input = raw.slice(0, 20000); // cap to keep it cheap
  const system =
    "You distill raw source material about a business/person into a concise profile " +
    "that an AI marketing advisor will use to personalize its advice. Output clean markdown, " +
    "no preamble. Capture only what's actually present: what they do, their offers and pricing, " +
    "their ideal customer/audience, positioning and voice, notable proof/results, and key links. " +
    "Be specific and brief — bullet points over prose. Omit anything not supported by the source. " +
    "No em dashes.";
  const user = `Source: ${sourceLabel}\n\nRAW CONTENT:\n${input}`;
  return complete(system, user, 1200);
}

// After a chat turn, decide whether the user revealed a durable business fact
// worth remembering. Returns the fact (one or two short lines) or "" if none.
export async function extractFact(
  userMessage: string,
  currentMemory: string,
): Promise<string> {
  const system =
    "You maintain a memory of durable facts about a user's business for an AI marketing advisor. " +
    "Given the user's latest chat message and the existing memory, decide if the message contains " +
    "a NEW, durable fact about their business (offer, pricing, audience, positioning, channel, goal, " +
    "result, constraint). If yes, output ONLY that fact as one or two short markdown bullet lines. " +
    "If there's nothing durable and new (e.g. it's just a question or already in memory), output exactly NONE. " +
    "Do not restate questions. No preamble, no em dashes.";
  const user = `EXISTING MEMORY:\n${currentMemory || "(empty)"}\n\nLATEST MESSAGE:\n${userMessage}`;
  const out = await complete(system, user, 200);
  if (!out || /^none$/i.test(out.trim())) return "";
  return out.trim();
}
