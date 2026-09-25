import type { ScreenShot } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { cn } from "@/components/ui/cn";

/** Wide captures take the full row; narrower ones pair up. */
export function ScreenshotList({
  shots,
  className,
}: {
  shots: readonly ScreenShot[];
  className?: string;
}) {
  if (shots.length === 0) return null;

  return (
    <ul className={cn("grid gap-10 sm:grid-cols-2", className)}>
      {shots.map((shot, index) => (
        <li
          key={shot.src}
          className={shot.width > 1200 ? "sm:col-span-2" : undefined}
        >
          <Reveal delay={index * 40}>
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
                <figcaption className="mt-3 max-w-measure text-sm text-fg-secondary">
                  {shot.caption}
                </figcaption>
              ) : null}
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
