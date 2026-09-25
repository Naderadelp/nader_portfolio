import type { ScreenShot } from "@/components/layout/types";

interface PhoneStripProps {
  items: readonly ScreenShot[];
  /** Small mono heading above the strip. */
  heading: string;
  /** Names the strip for assistive technology. Must describe the contents. */
  label: string;
  /** Optional line under the heading — used to state redaction, where it applies. */
  note?: string;
}

/**
 * A horizontally scrolling row of phone captures.
 *
 * Portrait screenshots at full width would be enormous and would push the rest
 * of the page down by several screens, so they run as a strip.
 *
 * `data-allows-x-scroll` opts the container out of the viewport-overflow
 * assertion in tests/responsive.test.ts: this element is *supposed* to be
 * wider than the screen, which is a different thing from the document
 * sidescrolling.
 *
 * The scroll container is the <div>, never the <ul>. Putting role="region" on
 * a list overrides its implicit list role and orphans every <li>, which is a
 * mistake this page has made before and which the axe suite caught. It also
 * takes focus: a scroll container a keyboard user cannot reach is a WCAG
 * 2.1.1 failure.
 */
export function PhoneStrip({ items, heading, label, note }: PhoneStripProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="font-mono text-micro uppercase text-fg-muted">{heading}</h4>
      {note ? (
        <p className="mt-2 max-w-measure text-sm text-fg-muted">{note}</p>
      ) : null}

      <div
        tabIndex={0}
        role="region"
        aria-label={label}
        data-allows-x-scroll=""
        className="mt-5 overflow-x-auto pb-4"
      >
        <ul className="flex snap-x snap-mandatory gap-5">
          {items.map((shot) => (
            <li
              key={shot.src}
              className="w-[13.5rem] shrink-0 snap-start sm:w-[15rem]"
            >
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full border border-hairline"
                />
                {shot.caption ? (
                  <figcaption className="mt-3 text-sm text-fg-secondary">
                    {shot.caption}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
