import { cn } from "./cn";

interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
  /** Small mono kicker above the heading. */
  eyebrow?: string;
  className?: string;
  /** h2 by default; h3 for nested blocks. */
  level?: 2 | 3;
}

/**
 * Section title. On small screens it sticks to the top with a blurred-free,
 * solid background so the reader always knows which section they are in.
 */
export function SectionHeading({
  id,
  children,
  eyebrow,
  className,
  level = 2,
}: SectionHeadingProps) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <div className={cn("mb-8", className)}>
      {eyebrow ? (
        <p className="mb-2 font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={cn(
          "font-semibold text-fg",
          level === 2 ? "text-section" : "text-lg",
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
