import { cn } from "@/components/ui/cn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SectionId } from "./types";

interface SectionProps {
  /** Must match a `SectionId` so the scroll-spy can observe it. */
  id: SectionId;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  /** Visually hide the heading (used by the hero, which carries the h1). */
  hideHeading?: boolean;
}

/**
 * One scroll-spy target. Renders a landmark `<section>` labelled by its own
 * heading, with consistent vertical rhythm between sections.
 */
export function Section({
  id,
  title,
  eyebrow,
  children,
  className,
  hideHeading = false,
}: SectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-section={id}
      className={cn("scroll-mt-24 py-14 lg:py-20 first:pt-0", className)}
    >
      {hideHeading ? (
        <h2 id={headingId} className="sr-only">
          {title}
        </h2>
      ) : (
        <SectionHeading id={headingId} eyebrow={eyebrow}>
          {title}
        </SectionHeading>
      )}
      {children}
    </section>
  );
}
