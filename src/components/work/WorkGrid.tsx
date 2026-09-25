import Link from "next/link";

import type { WorkCard } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { cn } from "@/components/ui/cn";

/**
 * The Work grid: every project as a card that opens its own page.
 *
 * Seven cards on a three-column grid would leave a hole, so on wide screens
 * the first and the last card span two columns — 2+1, 1+1+1, 1+2.
 *
 * The whole card is the link, and the title inside it is the accessible name.
 * Covers are decorative (`alt=""`): the card's text already says what the
 * project is, and the full alt text lives with the same image on its page.
 */
export function WorkGrid({ cards }: { cards: readonly WorkCard[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const wide =
          index === 0 || (index === cards.length - 1 && cards.length % 3 === 1);
        return (
          <li key={card.slug} className={cn(wide && "lg:col-span-2")}>
            <Reveal delay={(index % 3) * 40} className="h-full">
              <Link
                href={`/work/${card.slug}`}
                className="group flex h-full flex-col border border-hairline bg-surface/40 no-underline transition-colors duration-200 hover:border-accent focus-visible:border-accent motion-reduce:transition-none"
              >
                <Cover card={card} />

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="font-mono text-micro uppercase text-fg-muted">
                    {card.kindLabel}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-fg transition-colors duration-200 group-hover:text-accent motion-reduce:transition-none">
                    {card.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-fg-secondary">
                    {card.summary}
                  </p>
                  <p className="mt-auto pt-5 font-mono text-label text-fg-secondary">
                    <span className="text-accent">{card.claim}</span>
                  </p>
                  <p className="mt-2 font-mono text-micro uppercase text-fg-muted">
                    {card.tech.join(" · ")}
                  </p>
                </div>
              </Link>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Every cover is the same height, so the text below lines up across a row.
 * Wide captures are zoomed onto their top-left corner — shrunk to fit, a
 * dashboard becomes grey noise — and phone captures stand upright.
 */
function Cover({ card }: { card: WorkCard }) {
  const { cover } = card;
  const frame =
    "relative h-52 overflow-hidden border-b border-hairline bg-bg/60 sm:h-56";

  if (cover.type === "figure") {
    return (
      <div className={cn(frame, "flex flex-col justify-end p-6")}>
        <span className="font-mono text-[4.5rem] font-medium leading-none tracking-tight text-fg">
          {cover.value}
        </span>
        <span className="mt-3 max-w-xs font-mono text-label text-fg-secondary">
          {cover.label}
        </span>
      </div>
    );
  }

  if (cover.type === "phones") {
    return (
      <div className={cn(frame, "flex justify-center gap-4 px-6 pt-5")}>
        {cover.shots.map((shot) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={shot.src}
            src={shot.src}
            alt=""
            width={shot.width}
            height={shot.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-[28%] max-w-36 self-start border border-hairline transition-transform duration-300 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
          />
        ))}
      </div>
    );
  }

  // Phone captures only (roughly 9:19). A tall desktop crop is still read
  // from its top-left corner like any other page.
  const portrait = cover.shot.height > cover.shot.width * 1.5;
  return (
    // `data-clips-overflow` tells tests/responsive.test.ts that the oversized
    // image in here is clipped on purpose, not spilling off the page.
    <div
      data-clips-overflow=""
      className={cn(frame, portrait && "flex justify-center pt-5")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover.shot.src}
        alt=""
        width={cover.shot.width}
        height={cover.shot.height}
        loading="lazy"
        decoding="async"
        // Wide captures render at 60% of their real pixel size, so the text
        // in them stays readable; the frame shows the top-left corner.
        style={portrait ? undefined : { width: Math.round(cover.shot.width * 0.6) }}
        className={cn(
          "origin-top-left transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          portrait
            ? "h-auto w-40 origin-top border border-hairline"
            : "absolute left-0 top-0 max-w-none",
        )}
      />
    </div>
  );
}
