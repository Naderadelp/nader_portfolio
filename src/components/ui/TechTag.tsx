import { cn } from "./cn";

interface TechTagProps {
  children: React.ReactNode;
  className?: string;
  /** Renders as a plain <span> in a <ul>-less context when false. */
  as?: "li" | "span";
}

/** Mono-set tech label. Never used for body copy. */
export function TechTag({ children, className, as = "li" }: TechTagProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-surface",
        "px-2.5 py-1 font-mono text-label text-fg-secondary",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Convenience wrapper: a semantic list of tech tags. */
export function TechTagList({
  items,
  className,
  label = "Technologies used",
}: {
  items: readonly string[];
  className?: string;
  label?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label={label}>
      {items.map((item) => (
        <TechTag key={item}>{item}</TechTag>
      ))}
    </ul>
  );
}
