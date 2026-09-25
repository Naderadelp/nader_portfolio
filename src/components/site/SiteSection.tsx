import type { SectionId } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { cn } from "@/components/ui/cn";

interface SiteSectionProps {
  id: SectionId;
  /** Two-digit index, e.g. "02". Rendered beside the eyebrow. */
  index: string;
  /** Small mono label above the heading, e.g. "SELECTED WORK". */
  eyebrow: string;
  /** The section's real heading — a sentence, not a category name. */
  title: string;
  /** Optional line under the heading, set to the right on wide screens. */
  standfirst?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * One numbered section.
 *
 * The number and eyebrow are a navigational spine: they tell a reader who
 * landed mid-page how far through they are, which a single-page portfolio
 * otherwise never says. The heading below them is written as a claim rather
 * than a label — "Systems that keep their promises" instead of "Projects" —
 * because a reader skimming headings should collect an argument, not a
 * table of contents.
 */
export function SiteSection({
  id,
  index,
  eyebrow,
  title,
  standfirst,
  className,
  children,
}: SiteSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32",
        className,
      )}
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="font-mono text-micro uppercase text-accent"
          >
            {index}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-8 bg-accent-line"
          />
          <span className="font-mono text-micro uppercase text-fg-muted">
            {eyebrow}
          </span>
        </div>

        <div className="mt-6 gap-10 lg:flex lg:items-end lg:justify-between">
          <h2
            id={headingId}
            className="max-w-2xl text-headline font-semibold text-fg"
          >
            {title}
          </h2>
          {standfirst ? (
            <p className="mt-4 max-w-sm text-fg-muted lg:mt-0 lg:text-right">
              {standfirst}
            </p>
          ) : null}
        </div>
      </Reveal>

      <div className="mt-14">{children}</div>
    </section>
  );
}
