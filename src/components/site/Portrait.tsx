"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";

interface PortraitProps {
  src: string;
  alt: string;
  /** Rendered in the label strip under the frame. */
  name: string;
  /** Short status, e.g. "OPEN TO WORK". */
  status: string;
  className?: string;
}

/**
 * The hero photograph in a technical frame: hairline border, corner brackets,
 * and a mono label strip along the bottom.
 *
 * Client-side only because of the `onError` fallback. A portrait is an asset
 * someone drops in later, and a missing file must not leave a broken-image
 * glyph in the most prominent position on the site — if the load fails, the
 * frame keeps its shape and shows the monogram instead. That degradation is
 * the whole reason this is not a server component.
 */
export function Portrait({
  src,
  alt,
  name,
  status,
  className,
}: PortraitProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  /**
   * `onError` alone is not enough. The browser starts fetching the image while
   * it is parsing the server-rendered HTML, so a missing file has usually
   * already failed by the time React hydrates and attaches the handler — the
   * event fired with nothing listening, and the broken-image glyph and alt
   * text stay on screen forever.
   *
   * This re-checks on mount: a finished image that decoded to zero width did
   * not load. It is the only reliable way to catch the race.
   */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <figure className={cn("relative", className)}>
      {/* Amber bloom behind the frame, tying the portrait to the page glow.

          The inset must stay SMALLER than the page gutter. At -inset-6 (24px)
          against a 20px gutter this stuck 4px past the right edge of a 390px
          viewport and gave the whole document a horizontal scrollbar — the
          layout box overflows even though only blur is visible there.
          tests/responsive.test.ts fails if this creeps back up. */}
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="corner-brackets border border-hairline-strong bg-surface">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-sunken">
          {failed ? (
            <div
              aria-hidden="true"
              className="grid h-full w-full place-items-center"
            >
              <span className="font-mono text-6xl font-medium text-hairline-strong">
                {initials}
              </span>
            </div>
          ) : (
            /* WebP first, JPEG for anything that cannot take it. 43KB against
               98KB for the identical crop — worth the four extra lines on the
               largest image on the page.

               `output: 'export'` rules out next/image's default loader, so
               this is a plain <picture>; the 4:5 box above reserves the space,
               so there is no layout shift to guard against. */
            <picture>
              <source srcSet={src.replace(/\.jpg$/, ".webp")} type="image/webp" />
              <img
                ref={imgRef}
                src={src}
                alt={alt}
                width={760}
                height={950}
                fetchPriority="high"
                onError={() => setFailed(true)}
                className="h-full w-full object-cover object-top"
              />
            </picture>
          )}

          {/* Warm scrim along the bottom so the label strip never sits on a
              bright part of the photograph. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg/90 to-transparent"
          />
        </div>

        <figcaption className="flex items-center justify-between gap-3 border-t border-hairline px-3 py-2">
          <span className="truncate font-mono text-micro uppercase text-fg-muted">
            {name}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-micro uppercase text-ok">
            <span className="relative grid size-1.5 place-items-center">
              <span className="absolute size-full rounded-full bg-ok" />
              <span
                aria-hidden="true"
                className="absolute size-full animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-ok"
              />
            </span>
            {status}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
