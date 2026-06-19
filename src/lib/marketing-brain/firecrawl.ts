// Firecrawl website scrape (single page → markdown). Raw fetch, no SDK dep.

export async function scrapeUrl(url: string): Promise<string> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not set");

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Firecrawl scrape failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const markdown: string | undefined = data?.data?.markdown;
  if (!markdown || !markdown.trim()) {
    throw new Error("Firecrawl returned no readable content for that URL");
  }
  return markdown;
}
