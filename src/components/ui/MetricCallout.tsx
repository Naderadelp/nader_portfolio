import { cn } from "./cn";
import type { Metric } from "@/components/layout/types";

interface MetricCalloutProps extends Metric {
  className?: string;
}

/**
 * A single countable number, its label, and one line on how it was produced.
 * Static — deliberately not an animated counter.
 */
export function MetricCallout({
  value,
  label,
  mechanism,
  className,
}: MetricCalloutProps) {
  return (
    <figure
      className={cn(
        "rounded-lg border border-hairline bg-surface px-5 py-4",
        className,
      )}
    >
      <div className="font-mono text-metric tabular-nums text-fg">{value}</div>
      <figcaption className="mt-1.5">
        <span className="block font-mono text-label uppercase tracking-[0.08em] text-fg-secondary">
          {label}
        </span>
        <span className="mt-2 block max-w-measure text-sm leading-relaxed text-fg-muted">
          {mechanism}
        </span>
      </figcaption>
    </figure>
  );
}
