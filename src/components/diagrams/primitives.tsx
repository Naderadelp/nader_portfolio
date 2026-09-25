/**
 * Shared building blocks for the hand-authored inline SVG architecture diagrams.
 *
 * Design rules these primitives enforce:
 *  - No hardcoded colours. Everything resolves through `currentColor` or a theme
 *    token with a `color-mix(...)` fallback, so a diagram reads correctly on a
 *    #0b0b0d background and on a white one without any JS.
 *  - Two ink weights (text + line) plus a single violet accent. The accent is
 *    reserved for the one path each diagram is actually about.
 *  - Monospace labels at 11 user units or more, never less. 11 is the floor the
 *    responsive test enforces, and it applies to the hidden variant too: a
 *    `<text>` inside a `display:none` <svg> still reports its own font-size, so
 *    "it is hidden on phones" is not an excuse for a 9.5.
 *  - Labels sized so that they survive the viewBox scale they are drawn at.
 *    See NARROW below.
 *  - Motion only through CSS, always disabled under prefers-reduced-motion.
 *
 * These are server components: no state, no effects, no `use client`.
 */

import type { ReactNode } from "react";

/* -------------------------------------------------------------- type scale */

/**
 * The narrow (phone) type scale, and the arithmetic behind it.
 *
 * A font-size on an SVG `<text>` is in USER units, not CSS pixels. What the
 * reader actually sees is `size × (rendered width ÷ viewBox width)`, and on a
 * phone that ratio is the thing that bites: the diagram sits inside a
 * `<figure class="p-4">` inside the page gutters, so on a 320px screen — the
 * narrowest anyone browses on — the SVG is laid out at just **246 CSS px**.
 *
 * The old narrow variants used a 360-unit viewBox, i.e. a 0.68× scale, which
 * turned 9.5-unit labels into 6.5 rendered pixels. Unreadable, and invisible
 * on the desktop monitor the diagrams were authored on.
 *
 * The fix is to make the coordinate system SMALLER than the box it is painted
 * into, so the browser scales the whole drawing UP. Every narrow variant now
 * uses a 240-unit viewBox: 246 ÷ 240 ≈ 1.025×, so an 11-unit label lands at
 * ≈11.3 CSS px and a 12-unit title at ≈12.3 px. Both clear the 11px floor the
 * responsive test enforces, and they only get bigger on wider phones (a 390px
 * screen gives ≈1.32×).
 *
 * The cost is horizontal room: 240 units at ~0.59em per monospace character is
 * about 37 characters of full-bleed text. Labels are therefore re-wrapped, not
 * shrunk — the wording states facts about real systems and is not negotiable —
 * and the diagrams grew taller to pay for it. That is the cheap direction:
 * these are vertical stacks and the page already scrolls.
 */
export const NARROW = {
  /** Node headings. 12 × 1.025 ≈ 12.3 rendered px. */
  title: 12,
  /** Node sub-lines and free labels. 11 × 1.025 ≈ 11.3 rendered px. */
  label: 11,
  /**
   * Baseline-to-baseline for stacked sub-lines. 15 units for 11-unit text is
   * a 1.36 leading; the 12 the wide scale uses would let an 11-unit descender
   * touch the next line's cap.
   */
  lineGap: 15,
  /** Title baseline to first sub-line baseline; one notch more than lineGap. */
  titleGap: 16,
} as const;

/** Viewport-independent canvas width shared by all three narrow variants. */
export const NARROW_W = 240;

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

export type NodeProps = {
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
  /** Baseline-to-baseline between sub-lines, in user units. */
  lineGap?: number;
  /** Title baseline to first sub-line baseline, in user units. */
  titleGap?: number;
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
  // 11, not the 10 this started at: anything under 11 trips the responsive
  // test's legibility floor, hidden variant included.
  lineSize = 11,
  // 14, not 12: 11-unit text has a ~13.6-unit em box, so a 12-unit leading
  // makes consecutive sub-lines share a sliver of vertical space. Both gaps
  // are props because the narrow scale opens them further still.
  lineGap = 14,
  titleGap = 15,
}: NodeProps) {
  const cx = x + w / 2;
  const n = lines.length;
  // Lift the title by half the sub-line block so the whole stack, not just the
  // heading, sits centred in the rect.
  const first = y + h / 2 - (n * lineGap) / 2 + 4;
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
          y={first + titleGap + i * lineGap}
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

export type LabelProps = {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  tone?: "muted" | "ink" | "accent";
  /** Degrees, rotated about (x, y). -90 reads bottom-to-top. */
  rotate?: number;
};

export function Label({
  x,
  y,
  children,
  anchor = "middle",
  // See Node.lineSize: 11 user units is the floor, everywhere.
  size = 11,
  tone = "muted",
  rotate,
}: LabelProps) {
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
  size = 11,
  stacked = false,
  rowGap = 17,
}: {
  x: number;
  y: number;
  accentLabel: string;
  dashLabel: string;
  gap?: number;
  size?: number;
  /**
   * Put the dashed key on its own row underneath instead of beside the accent
   * one. Side by side, the two keys plus their 28-unit swatches need roughly
   * 300 user units; the narrow canvas has 240, so on phones the legend has to
   * stack or it runs off the right edge.
   */
  stacked?: boolean;
  /** Baseline-to-baseline when stacked. */
  rowGap?: number;
}) {
  // Stacked: same x, next row down. Side by side: same baseline, `gap` across.
  const dashX = stacked ? x : x + gap;
  const dashY = stacked ? y + rowGap : y;

  return (
    <g>
      <path d={`M ${x} ${y - 4} H ${x + 28}`} className="ln-acc-base" />
      <path d={`M ${x} ${y - 4} H ${x + 28}`} className="ln-acc-flow" />
      <text x={x + 36} y={y} fontSize={size} className="t2">
        {accentLabel}
      </text>
      <path d={`M ${dashX} ${dashY - 4} H ${dashX + 28}`} className="ln ln-dash" />
      <text x={dashX + 36} y={dashY} fontSize={size} className="t2">
        {dashLabel}
      </text>
    </g>
  );
}

/* --------------------------------------------- narrow-scale convenience set */

/*
 * The three narrow variants all want the same type scale (NARROW above), and
 * threading four size props through ~20 call sites each would bury the
 * geometry that actually matters. These wrappers apply the scale once; every
 * prop stays overridable for the odd pill or heading that needs to differ.
 */

/** `Node` at the narrow type scale. */
export function NNode({
  titleSize = NARROW.title,
  lineSize = NARROW.label,
  lineGap = NARROW.lineGap,
  titleGap = NARROW.titleGap,
  ...rest
}: NodeProps) {
  return (
    <Node
      {...rest}
      titleSize={titleSize}
      lineSize={lineSize}
      lineGap={lineGap}
      titleGap={titleGap}
    />
  );
}

/** `Label` at the narrow type scale. */
export function NLabel({ size = NARROW.label, ...rest }: LabelProps) {
  return <Label {...rest} size={size} />;
}
