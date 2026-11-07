# Three-key onboarding

**Status:** Implemented and locally validated; production verification recorded in the release receipt.

Make connecting Kie AI, Apify and Firecrawl step 2, immediately after opening the downloaded folder. Keep setup terminal-free: a copyable agent instruction creates or opens the local `.env` file, preserves existing values, and lets the person paste keys privately. Link directly to each provider's key settings and explain the creation path and matching variable. Renumber the brief and review steps to 3 and 4.

Update the public project's README, agent instructions and `.env.example` to match, rebuild the credential-scanned download from the exact committed source, and deploy the website. Preserve the ten-style workflow and existing example/reference galleries.

## Verification

- Official key-management destinations verified against provider documentation: Kie `/api-key`, Apify console `/settings/integrations`, Firecrawl `/app/api-keys`.
- Exercise both copy prompts, all three links, `.env` instructions and four-step structured data at desktop and 390px mobile sizes. Inspect screenshots for readability and overflow.
- Scan source, website changes and ZIP for credentials, then verify the production page and actual downloaded archive hash.

## Results

- Production build and 16 desktop/mobile browser checks passed; all 12 guide checks passed again after final clarity fixes. Both copy prompts, provider destinations, variable names, four-step schema, download and existing examples work.
- Independent visual review passed. Shortened placeholders avoid mobile line breaks; the last step now explicitly tells visitors to open the preview link supplied by their agent.
- Website and downloadable README use identical starter and setup prompts; `.env.example` uses the same three placeholders. Exact publication trees and downloadable archive receive credential scans before deployment. No paid provider requests were made.
