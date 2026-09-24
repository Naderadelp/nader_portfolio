import { cn } from "@/components/ui/cn";
import { DiagramFrame, Edge, Label, Legend, Node } from "./primitives";

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

      <Label x={40} y={34} anchor="start" size={10.5}>
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
          <Label x={c} y={376} size={10} tone="ink">
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

      <Label x={40} y={420} anchor="start" size={10}>
        Nothing writes a stage. Adding a review stamp moves the record forward,
      </Label>
      <Label x={40} y={436} anchor="start" size={10}>
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
  const pillX = 22;
  const pillW = 226;
  const boxX = 56;
  const boxW = 288;
  const cx = 135;
  const rows = [52, 172, 292, 412, 546];

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 360 744"
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      <rect x={8} y={534} width={344} height={184} rx={10} className="zone" />

      <Label x={16} y={18} anchor="start" size={10.5} tone="ink">
        stage = f(timestamps)
      </Label>
      <Label x={16} y={32} anchor="start">
        no status column to drift
      </Label>

      {/* the timeline rail the stamps hang from */}
      <path d="M 8 66 V 574" className="ln" />

      {rows.map((ry, i) => (
        <g key={STAMPS[i].name}>
          {i === 0 ? (
            <circle cx={8} cy={ry + 14} r={3} className="dot-open" />
          ) : (
            <circle cx={8} cy={ry + 14} r={3} className="dot" />
          )}
          <Node
            x={pillX}
            y={ry}
            w={pillW}
            h={28}
            rx={14}
            tone="note"
            title={i === 4 ? "window_closes_at ≤ now" : STAMPS[i].name}
            titleSize={10.5}
          />
          <Edge id={id} kind="accent" d={`M ${cx} ${ry + 28} V ${ry + 50}`} />
          <Node
            x={boxX}
            y={ry + 50}
            w={boxW}
            h={44}
            title={STAGES[i].title}
            lines={[STAGES[i].sub]}
          />
        </g>
      ))}

      <Label x={16} y={524} anchor="start">
        window closes — middleware fails closed
      </Label>
      <path d="M 16 530 H 344" className="ln ln-dash" />

      <Edge id={id} d="M 200 640 V 660" />
      <Node
        x={boxX}
        y={660}
        w={boxW}
        h={52}
        tone="note"
        title="middleware fails closed"
        lines={["nothing editable after this"]}
      />

      <Legend x={16} y={734} gap={150} accentLabel="derivation" dashLabel="closed window" />
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
