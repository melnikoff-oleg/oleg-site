import type { NameIdea } from "./data";

/** One candidate: the picture, the name, its .com and the story behind it. */
export function NameCard({ idea }: { idea: NameIdea }) {
  return (
    <article className="wsl-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wsl-img" src={idea.image} alt="" loading={idea.n > 2 ? "lazy" : undefined} />
      <div className="wsl-body">
        <div className="wsl-rank">{String(idea.n).padStart(2, "0")}</div>
        <h2>{idea.name}</h2>
        <div className="wsl-domain"><b>{idea.domain}</b><span>{idea.price}</span></div>
        <p>{idea.story}</p>
      </div>
    </article>
  );
}
