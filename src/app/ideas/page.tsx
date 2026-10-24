import { PHASE_PRODUCTION_BUILD } from "next/constants";
import Link from "next/link";
import { ResourceFooter } from "@/components/resource-footer";
import { listIdeas, type Idea } from "@/lib/ideas/db";
import { IdeaBoard } from "./components/idea-board";

// Cached first, then synced, the way Telegram opens a chat. The board is the
// same for every visitor, so the page is static and served from the edge cache:
// refreshed in the background a minute after it goes stale, and purged when an
// idea appears or changes (revalidatePath in the admin route; a vote does not
// purge it, since the mount sync brings counts up to date). What only this
// browser knows, which ideas it voted for, and anything newer than the cached
// copy arrive from GET /api/ideas the moment the board mounts. It used to read
// the cookie and wait on two database queries before sending a byte: about a
// second to first byte, on the one page that asks a visitor to act.
export const revalidate = 60;

export default async function IdeasPage() {
  let ideas: Idea[] = [];
  try {
    ideas = await listIdeas();
  } catch (err) {
    // At runtime a failed read throws, so a background rebuild fails and the
    // cache keeps serving its last good board. At build there is no last good
    // board: ship an empty one rather than a failed deploy, which the mount
    // sync fills in and the next rebuild replaces.
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw err;
    console.error(err);
  }

  return (
    <>
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <Link
            href="https://www.youtube.com/@Oleg-Melnikov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </Link>
        </div>
      </header>

      <main>
        <section className="pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue">
              you decide
            </span>

            <h1 className="text-metallic mt-8 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              What should I build next?
            </h1>

            <p className="mt-4 font-body text-lg text-silver-muted md:text-xl">
              Vote for the video you want to see. The ideas with the most votes are the
              ones I make.
            </p>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="mx-auto max-w-3xl px-6">
            <IdeaBoard initialIdeas={ideas} />

            <p className="mt-8 font-body text-sm text-silver-muted">
              One vote per idea per browser. I log an ip address and a browser id with
              every action, only to keep the board honest.
            </p>
          </div>
        </section>
      </main>

      <ResourceFooter currentSlug="ideas" boldaneCredit />
    </>
  );
}
