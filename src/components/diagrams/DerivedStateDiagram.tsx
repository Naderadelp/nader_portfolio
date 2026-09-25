import { cn } from "@/components/ui/cn";
import {
  DiagramFrame,
  Edge,
  Label,
  Legend,
  NARROW,
  NARROW_W,
  Node,
  NLabel,
  NNode,
} from "./primitives";

const TITLE = "Appraisal stages derived from timestamps";

const DESC =
  "The five workflow stages — draft, submitted, manager reviewed, senior reviewed and " +
  "read-only — are not stored in a status column. Each one is derived on read from the " +
  "submission and review timestamps beneath it: draft while no stamp exists, submitted " +
  "once submitted_at is set, manager reviewed once manager_reviewed_at is set, senior " +
  "reviewed once senior_reviewed_at is set, and read-only once now is past " +
  "window_closes_at. Because the stage is a function of the evidence it can never drift " +
  "from it. After the window closes the middleware fails closed and every write is " +
  "rejected.";

const STAGES: ReadonlyArray<{ title: string; sub: string }> = [
  { title: "draft", sub: "employee edits" },
  { title: "submitted", sub: "awaiting manager" },
  { title: "manager reviewed", sub: "awaiting senior" },
  { title: "senior reviewed", sub: "final scoring" },
  { title: "read-only", sub: "every write 403" },
];

const STAMPS: ReadonlyArray<{ name: string; note: string; rule: string }> = [
  { name: "— no stamp yet", note: "record created", rule: "no stamp recorded" },
  { name: "submitted_at", note: "employee submits", rule: "submitted_at ≠ null" },
  { name: "manager_reviewed_at", note: "manager signs off", rule: "manager_reviewed_at ≠ null" },
  { name: "senior_reviewed_at", note: "senior signs off", rule: "senior_reviewed_at ≠ null" },
  { name: "window_closes_at", note: "cycle deadline", rule: "now ≥ window_closes_at" },
];

/* ------------------------------------------------------------- wide (roomy) */

function Wide() {
  const id = "ds-w";
  const cols = [120, 300, 480, 660, 840];
  const boxY = 92;
  const boxH = 64;
  const boxW = 160;
  const axisY = 352;

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 960 500"
      title={TITLE}
      desc={DESC}
      className="hidden @4xl:block"
    >
      {/* everything right of the boundary is frozen */}
      <rect x={748} y={44} width={196} height={432} rx={10} className="zone" />
      <path d="M 744 44 V 476" className="ln ln-dash" />
      <Label x={752} y={34} anchor="start" tone="ink">
        window closes
      </Label>

      <Label x={40} y={34} anchor="start">
        stage is derived on read — there is no status column that can drift
      </Label>

      {STAGES.map((stage, i) => (
        <Node
          key={stage.title}
          x={cols[i] - boxW / 2}
          y={boxY}
          w={boxW}
          h={boxH}
          title={stage.title}
          lines={[stage.sub]}
        />
      ))}

      {cols.slice(0, 4).map((c) => (
        <Edge key={`t-${c}`} id={id} d={`M ${c + boxW / 2} 124 H ${c + 180 - boxW / 2}`} />
      ))}

      {/* the derivation itself: stamps below, stages above */}
      {cols.map((c, i) => (
        <g key={`d-${c}`}>
          <Edge id={id} kind="accent" d={`M ${c} ${axisY - 8} V ${boxY + boxH}`} />
          <Label x={c - 11} y={250} rotate={-90} tone="accent">
            {STAMPS[i].rule}
          </Label>
        </g>
      ))}

      <Label x={40} y={334} anchor="start">
        timestamps — the only stored truth
      </Label>
      <path d={`M 40 ${axisY} H 920`} className="ln" />

      {cols.map((c, i) => (
        <g key={`s-${c}`}>
          {i === 0 ? (
            <circle cx={c} cy={axisY} r={4} className="dot-open" />
          ) : (
            <circle cx={c} cy={axisY} r={4} className="dot" />
          )}
          <Label x={c} y={376} tone="ink">
            {STAMPS[i].name}
          </Label>
          <Label x={c} y={390}>
            {STAMPS[i].note}
          </Label>
        </g>
      ))}

      <Node
        x={744}
        y={404}
        w={200}
        h={58}
        tone="note"
        title="middleware fails closed"
        lines={["nothing editable after this"]}
      />

      <Label x={40} y={420} anchor="start">
        Nothing writes a stage. Adding a review stamp moves the record forward,
      </Label>
      <Label x={40} y={436} anchor="start">
        removing one moves it back — evidence and state cannot disagree.
      </Label>

      <Legend
        x={40}
        y={492}
        gap={250}
        accentLabel="derivation (stamp → stage)"
        dashLabel="closed window · read-only"
      />
    </DiagramFrame>
  );
}

/* ---------------------------------------------------------- narrow (tight) */

function Narrow() {
  const id = "ds-n";
  // 240-unit canvas (see NARROW in primitives). The rail sits hard against the
  // left edge; the stamp pill hangs off it and the stage box it derives is
  // indented past it, so the eye reads stamp-then-stage without an arrow
  // having to say so.
  const railX = 6;
  const pillX = 16;
  const pillW = 164; // fits "window_closes_at ≤ now" (22 chars ≈ 143) with ~10 either side
  const pillCx = pillX + pillW / 2; // 98
  const boxX = 28;
  const boxW = 204;
  const boxCx = boxX + boxW / 2; // 130

  // One row = pill (28) + 22 of arrow + stage box (46) = 96 units, on a
  // 120-unit pitch. The last row is pushed down to 562 to clear the closed-
  // window rule, which needs two lines of label above it now that the label
  // is too long for one 240-unit line.
  const rows = [44, 164, 284, 404, 562];

  return (
    <DiagramFrame
      id={id}
      viewBox={`0 0 ${NARROW_W} 780`}
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      {/* everything below the rule is frozen */}
      <rect x={4} y={552} width={232} height={180} rx={10} className="zone" />

      <NLabel x={8} y={16} anchor="start" size={NARROW.title} tone="ink">
        stage = f(timestamps)
      </NLabel>
      <NLabel x={8} y={32} anchor="start">
        no status column to drift
      </NLabel>

      {/* the timeline rail the stamps hang from */}
      <path d={`M ${railX} 48 V 590`} className="ln" />

      {rows.map((ry, i) => (
        <g key={STAMPS[i].name}>
          {i === 0 ? (
            <circle cx={railX} cy={ry + 14} r={3} className="dot-open" />
          ) : (
            <circle cx={railX} cy={ry + 14} r={3} className="dot" />
          )}
          {/* Pill heading takes the sub-line size, not the heading size: it is
              a column name, not a title, and 19-character names like
              manager_reviewed_at only fit the pill at 11. */}
          <NNode
            x={pillX}
            y={ry}
            w={pillW}
            h={28}
            rx={14}
            tone="note"
            title={i === 4 ? "window_closes_at ≤ now" : STAMPS[i].name}
            titleSize={NARROW.label}
          />
          <Edge id={id} kind="accent" d={`M ${pillCx} ${ry + 28} V ${ry + 50}`} />
          <NNode
            x={boxX}
            y={ry + 50}
            w={boxW}
            h={46}
            title={STAGES[i].title}
            lines={[STAGES[i].sub]}
          />
        </g>
      ))}

      {/* Re-wrapped, not reworded: the single line was 39 characters, ~253
          units at size 11, against a 240-unit canvas. */}
      <NLabel x={8} y={524} anchor="start">
        window closes —
      </NLabel>
      <NLabel x={8} y={540} anchor="start">
        middleware fails closed
      </NLabel>
      <path d="M 8 548 H 232" className="ln ln-dash" />

      <Edge id={id} d={`M ${boxCx} 658 V 678`} />
      <NNode
        x={boxX}
        y={678}
        w={boxW}
        h={46}
        tone="note"
        title="middleware fails closed"
        lines={["nothing editable after this"]}
      />

      <Legend
        x={8}
        y={752}
        size={NARROW.label}
        stacked
        accentLabel="derivation"
        dashLabel="closed window"
      />
    </DiagramFrame>
  );
}

/**
 * Which variant is drawn follows the width of the column the diagram sits
 * in, not the width of the viewport: the main column is ~490-720px at every
 * desktop breakpoint, and the 960-unit wide variant is unreadable scaled into
 * that (9.5px labels land at ~7px). `@container` makes the switch honest.
 */
export function DerivedStateDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("@container", className)}>
      <Wide />
      <Narrow />
    </div>
  );
}
