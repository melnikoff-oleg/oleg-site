# LinkedIn packaging: agent-first download and local review

**Status:** Implemented; release checks below.

**Request:** Eliminate visitor terminal/GitHub steps. Download the folder directly, open it in Claude Code/Codex, provide a natural-language profile/branding brief, and review/revise locally with usable and editable downloads.

## Implementation

- Keep the established site design and both three-style visual comparisons.
- Replace command/OS/provider controls with a single copyable brief and three short steps.
- Serve the complete sanitized public project as a same-origin static ZIP with attachment headers and a provenance/hash manifest. Extend the shared CTA with optional native download behavior; other pages keep their existing links.
- Add agent instructions for both platforms to the public project. The agent owns setup, evidence/branding work, visual validation and feedback revisions; optional provider keys stay local.
- Add a loopback-only local viewer with safe upload/source downloads, automatic revision refresh and feedback copying. Preserve complete editable dependencies; do not expose project-root files or secrets.

## Validation

- Public-project tests and independent security/correctness review of the local viewer.
- Exact staged-source credential and asset audit, reproducible ZIP and fresh extraction/setup/serve/download check.
- Site production build, mobile/desktop interaction and download tests, visual inspection and shared CTA regression checks.
- Push source changes, deploy site, then verify live download bytes/hash and page behavior.

## Release record

- Public project: `2386239807c91c6b6caeb54fa4e5b7290b0dda82`; 323 tracked files. Source tests: 260 passed, plus 14 final viewer tests after the wording change. Two credential scans passed; independent viewer audit found no remaining issues.
- Direct project ZIP: 57,145,260 bytes, SHA-256 `7940daf6559db0194e9cd17e3c6af6fc48cad1ed25f6895c4337d75a73e6b3b7`. The adjacent JSON manifest records the exact source tree and commit.
- Site production build and 110 unit tests passed. Shared download-CTA regression checks passed on desktop and mobile. A first-time visitor simulation visually reviewed desktop and 390px mobile; its style-preference prompt fix is included.
- Final production page/download verification is saved with the private project release receipt. No provider requests are needed for release validation.

## Sources

- Official Codex app documentation: https://developers.openai.com/codex/app (redirects to https://learn.chatgpt.com/docs/app; local folder and Codex chat workflow).
- Claude Code desktop: https://code.claude.com/docs/en/desktop (local project sessions and file context).
- Vercel limits: https://vercel.com/docs/limits (static hosting; ZIP is served from public/, not a function response).
