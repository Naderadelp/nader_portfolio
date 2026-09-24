/**
 * Shared building blocks for the hand-authored inline SVG architecture diagrams.
 *
 * Design rules these primitives enforce:
 *  - No hardcoded colours. Everything resolves through `currentColor` or a theme
 *    token with a `color-mix(...)` fallback, so a diagram reads correctly on a
 *    #0b0b0d background and on a white one without any JS.
 *  - Two ink weights (text + line) plus a single violet accent. The accent is
 *    reserved for the one path each diagram is actually about.
 *  - Monospace labels at 9.5-11.5px.
 *  - Motion only through CSS, always disabled under prefers-reduced-motion.
 *
 * These are server components: no state, no effects, no `use client`.
 */

import type { ReactNode } from "react";

/* ------------------------------------------------------------------ styles */

const CSS = `
.dgm {
  --dgm-line: var(--color-border, color-mix(in srgb, currentColor 32%, transparent));
  --dgm-mut: var(--color-text-muted, color-mix(in srgb, currentColor 62%, transparent));
  --dgm-acc: var(--color-accent, #7c5cff);
}
.dgm text {
  font-family: var(--font-geist-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  letter-spacing: -0.01em;
}
.dgm .nd { fill: none; stroke: var(--dgm-line); stroke-width: 1; }
.dgm .nd-soft { fill: currentColor; fill-opacity: 0.04; }
.dgm .nd-ext { stroke-dasharray: 5 4; }
.dgm .nd-note { stroke-dasharray: 4 4; }
.dgm .nd-acc { stroke: var(--dgm-acc); stroke-width: 1.4; fill: var(--dgm-acc); fill-opacity: 0.07; }
.dgm .t1 { fill: currentColor; }
.dgm .t2 { fill: var(--dgm-mut); }
.dgm .t-acc { fill: var(--dgm-acc); }
.dgm .ln { fill: none; stroke: var(--dgm-line); stroke-width: 1; }
.dgm .ln-dash { stroke-dasharray: 5 4; }
.dgm .ln-acc-base { fill: none; stroke: var(--dgm-acc); stroke-opacity: 0.3; stroke-width: 1.6; }
.dgm .ln-acc-flow {
  fill: none; stroke: var(--dgm-acc); stroke-width: 1.6; stroke-dasharray: 4 8;
  animation: dgm-flow 1.4s linear infinite;
}
.dgm .ln-acc-dash { fill: none; stroke: var(--dgm-acc); stroke-width: 1.2; stroke-dasharray: 3 4; }
.dgm .mk { fill: var(--dgm-line); }
.dgm .mk-acc { fill: var(--dgm-acc); }
.dgm .zone { fill: currentColor; fill-opacity: 0.045; }
.dgm .dot { fill: var(--dgm-acc); }
.dgm .dot-open { fill: none; stroke: var(--dgm-line); }
@keyframes dgm-flow { to { stroke-dashoffset: -24; } }
@media (prefers-reduced-motion: reduce) {
  .dgm .ln-acc-flow { animation: none; stroke-dasharray: none; }
}
`;

/* ------------------------------------------------------------------- frame */

export function DiagramFrame({
  id,
  viewBox,
  title,
  desc,
  className,
  children,
}: {
  /** Unique per <svg>; namespaces the marker ids so several diagrams can share a page. */
  id: string;
  viewBox: string;
  title: string;
  desc: string;
  /**
   * Must include a display utility (`hidden @4xl:block` / `block @4xl:hidden`).
   * The switch is a container query, not a media query: what decides which
   * variant is readable is the width of the column the diagram lands in, not
   * the width of the window. The base class deliberately omits `block` so a
   * responsive variant never fights a `hidden` sitting on the same element.
   */
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      focusable="false"
      className={`dgm h-auto w-full font-mono${className ? ` ${className}` : ""}`}
    >
      <title>{title}</title>
      <desc>{desc}</desc>
      <style>{CSS}</style>
      <defs>
        <marker
          id={`${id}-tip`}
          viewBox="0 0 10 10"
          refX="9.5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="mk" />
        </marker>
        <marker
          id={`${id}-tip-acc`}
          viewBox="0 0 10 10"
          refX="9.5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" className="mk-acc" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

/* -------------------------------------------------------------------- node */

export type NodeTone = "base" | "soft" | "ext" | "note" | "accent";

const TONE_CLASS: Record<NodeTone, string> = {
  base: "nd",
  soft: "nd nd-soft",
  ext: "nd nd-ext",
  note: "nd nd-note",
  accent: "nd nd-acc",
};

export function Node({
  x,
  y,
  w,
  h,
  title,
  lines = [],
  tone = "base",
  rx = 8,
  titleSize = 11.5,
  lineSize = 10,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines?: string[];
  tone?: NodeTone;
  rx?: number;
  titleSize?: number;
  lineSize?: number;
}) {
  const cx = x + w / 2;
  const n = lines.length;
  const first = y + h / 2 - (n * 12) / 2 + 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} className={TONE_CLASS[tone]} />
      <text
        x={cx}
        y={first}
        textAnchor="middle"
        fontSize={titleSize}
        className={tone === "accent" ? "t1 t-acc" : "t1"}
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={`${line}-${i}`}
          x={cx}
          y={first + 14 + i * 12}
          textAnchor="middle"
          fontSize={lineSize}
          className="t2"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* -------------------------------------------------------------------- edge */

export type EdgeKind = "base" | "dash" | "accent" | "accentDash";

export function Edge({
  d,
  id,
  kind = "base",
  marker = true,
}: {
  d: string;
  /** Must match the DiagramFrame id so the arrowhead markers resolve. */
  id: string;
  kind?: EdgeKind;
  marker?: boolean;
}) {
  const tip = marker ? `url(#${id}-tip)` : undefined;
  const tipAcc = marker ? `url(#${id}-tip-acc)` : undefined;

  if (kind === "accent") {
    // Solid accent underneath keeps the path readable when motion is disabled;
    // the dashed copy on top is the flow animation.
    return (
      <g>
        <path d={d} className="ln-acc-base" markerEnd={tipAcc} />
        <path d={d} className="ln-acc-flow" />
      </g>
    );
  }
  if (kind === "accentDash") {
    return <path d={d} className="ln-acc-dash" markerEnd={tipAcc} />;
  }
  return <path d={d} className={kind === "dash" ? "ln ln-dash" : "ln"} markerEnd={tip} />;
}

/* ------------------------------------------------------------------ labels */

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  size = 9.5,
  tone = "muted",
  rotate,
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  tone?: "muted" | "ink" | "accent";
  /** Degrees, rotated about (x, y). -90 reads bottom-to-top. */
  rotate?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      className={tone === "accent" ? "t2 t-acc" : tone === "ink" ? "t1" : "t2"}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** Bottom-of-diagram key: one accent swatch, one dashed swatch. */
export function Legend({
  x,
  y,
  accentLabel,
  dashLabel,
  gap = 150,
}: {
  x: number;
  y: number;
  accentLabel: string;
  dashLabel: string;
  gap?: number;
}) {
  return (
    <g>
      <path d={`M ${x} ${y - 4} H ${x + 28}`} className="ln-acc-base" />
      <path d={`M ${x} ${y - 4} H ${x + 28}`} className="ln-acc-flow" />
      <text x={x + 36} y={y} fontSize="9.5" className="t2">
        {accentLabel}
      </text>
      <path d={`M ${x + gap} ${y - 4} H ${x + gap + 28}`} className="ln ln-dash" />
      <text x={x + gap + 36} y={y} fontSize="9.5" className="t2">
        {dashLabel}
      </text>
    </g>
  );
}
