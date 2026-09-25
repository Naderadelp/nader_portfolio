import { cn } from "@/components/ui/cn";
import {
  DiagramFrame,
  Edge,
  Label,
  Legend,
  NARROW_W,
  Node,
  NLabel,
  NNode,
} from "./primitives";

const TITLE = "Bidirectional ERP sync";

const DESC =
  "Outbound: a model write fires an observer, which queues a PushJob that calls a typed " +
  "ERP client. The ERP returns a remote id and the observer stores it with a quiet save, " +
  "so no model events fire and the sync cannot loop back on itself. Inbound: an ERP " +
  "webhook is checked by an API-key validator, queued to a webhook processor and upserted " +
  "locally; eight scheduled pull commands (products, stock, categories, units of measure, " +
  "locations, vendors, visits and salespeople) upsert through the same path. Every run in " +
  "either direction writes a SyncRun row recording its outcome.";

/* ------------------------------------------------------------- wide (roomy) */

function Wide() {
  const id = "erp-w";
  const w = 150;
  const xs = [41, 223, 405, 587, 769];
  const outY = 92;
  const inY = 336;
  const h = 72;

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 960 620"
      title={TITLE}
      desc={DESC}
      className="hidden @4xl:block"
    >
      <Label x={16} y={26} anchor="start" tone="ink">
        OUTBOUND · app → ERP
      </Label>

      {/* the decision worth the accent: remote id written back without model events */}
      <Edge
        id={id}
        kind="accent"
        d="M 844 92 V 66 Q 844 58 834 58 H 308 Q 298 58 298 66 V 92"
      />
      <Label x={571} y={50} tone="accent">
        returns remote_id
      </Label>

      <Node x={xs[0]} y={outY} w={w} h={h} title="Model write" lines={["create / update"]} />
      <Node x={xs[1]} y={outY} w={w} h={h} tone="accent" title="Observer" lines={["saved() hook"]} />
      <Node x={xs[2]} y={outY} w={w} h={h} title="PushJob" lines={["queued"]} />
      <Node x={xs[3]} y={outY} w={w} h={h} title="ERP client" lines={["typed DTOs"]} />
      <Node x={xs[4]} y={outY} w={w} h={h} tone="ext" title="ERP" lines={["remote system"]} />

      {xs.slice(0, 4).map((x) => (
        <Edge key={x} id={id} d={`M ${x + w} ${outY + h / 2} H ${x + w + 32}`} />
      ))}

      <Edge id={id} kind="accentDash" d="M 298 164 V 194" />
      <Node
        x={223}
        y={194}
        w={262}
        h={70}
        tone="accent"
        title="saveQuietly()"
        lines={["remote id written back with", "model events suppressed", "→ no infinite sync loop"]}
      />

      <Node
        x={587}
        y={194}
        w={332}
        h={70}
        title="SyncRun"
        lines={["one row per push, webhook & pull", "started · counts · failure"]}
      />
      <Edge id={id} kind="dash" d="M 480 164 V 180 H 700 V 194" />
      <Edge id={id} kind="dash" d="M 662 336 V 264" />

      <path d="M 16 300 H 560" className="ln" />
      <Label x={16} y={322} anchor="start" tone="ink">
        INBOUND · ERP → app
      </Label>

      <Node
        x={xs[0]}
        y={inY}
        w={w}
        h={h}
        tone="ext"
        title="ERP webhook"
        lines={["POST, unsolicited"]}
      />
      <Node x={xs[1]} y={inY} w={w} h={h} title="API-key" lines={["validator · 401 else"]} />
      <Node x={xs[2]} y={inY} w={w} h={h} title="Processor" lines={["queued job"]} />
      <Node x={xs[3]} y={inY} w={w} h={h} title="Local upsert" lines={["match on remote id"]} />

      {xs.slice(0, 3).map((x) => (
        <Edge key={`in-${x}`} id={id} d={`M ${x + w} ${inY + h / 2} H ${x + w + 32}`} />
      ))}

      <Node
        x={41}
        y={440}
        w={332}
        h={96}
        title="8 scheduled pull commands"
        lines={[
          "products · stock · categories",
          "units of measure · locations",
          "vendors · visits · salespeople",
        ]}
      />
      <Edge id={id} d="M 373 488 H 642 Q 652 488 652 478 V 408" />
      <Label x={500} y={480}>
        upsert
      </Label>

      <Label x={41} y={568} anchor="start">
        Every direction ends in the same upsert, keyed by the stored remote id.
      </Label>
      <Label x={41} y={584} anchor="start">
        Inbound writes reuse the quiet save, so nothing bounces back to the ERP.
      </Label>

      <Legend
        x={41}
        y={606}
        gap={190}
        accentLabel="the no-loop decision"
        dashLabel="external · scheduled · recorded"
      />
    </DiagramFrame>
  );
}

/* ---------------------------------------------------------- narrow (tight) */

function Narrow() {
  const id = "erp-n";
  // Same 240-unit canvas and channel geometry as the other two narrow
  // variants — see NARROW in primitives for why 240 rather than 360.
  const x = 8;
  const w = 200;
  const cx = x + w / 2; // 108
  const right = x + w; // 208
  const chan = 218; // the one vertical channel, shared by both loop-backs
  const chanLabel = 232; // rotated-label baseline

  const h1 = 46; // heading + one sub-line
  const h2 = 60; // heading + two

  return (
    <DiagramFrame
      id={id}
      viewBox={`0 0 ${NARROW_W} 972`}
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      <NLabel x={x} y={16} anchor="start" tone="ink">
        OUTBOUND · app → ERP
      </NLabel>

      <NNode x={x} y={28} w={w} h={h1} title="Model write" lines={["create / update"]} />
      <Edge id={id} d={`M ${cx} 74 V 98`} />
      <NNode x={x} y={98} w={w} h={h1} tone="accent" title="Observer" lines={["saved() hook"]} />
      <Edge id={id} d={`M ${cx} 144 V 168`} />
      <NNode x={x} y={168} w={w} h={h1} title="PushJob" lines={["queued"]} />
      <Edge id={id} d={`M ${cx} 214 V 238`} />
      <NNode x={x} y={238} w={w} h={h1} title="ERP client" lines={["typed DTOs"]} />
      <Edge id={id} d={`M ${cx} 284 V 308`} />
      <NNode x={x} y={308} w={w} h={h1} tone="ext" title="ERP" lines={["remote system"]} />

      {/* ERP answers with a remote id, which is stored without firing model events */}
      <Edge id={id} kind="accent" d={`M ${cx} 354 V 372`} />
      <NNode
        x={x}
        y={372}
        w={w}
        h={h2}
        tone="accent"
        title="saveQuietly()"
        lines={["remote id stored", "no model events fire"]}
      />
      {/* Back up to the Observer (mid-height 121) — the hop that would be an
          infinite loop if the write-back fired model events. */}
      <Edge
        id={id}
        kind="accent"
        d={`M ${right} 402 H 212 Q ${chan} 402 ${chan} 396 V 127 Q ${chan} 121 212 121 H ${right}`}
      />
      <NLabel x={chanLabel} y={262} rotate={-90} tone="accent">
        no infinite sync loop
      </NLabel>

      <path d={`M ${x} 452 H ${chanLabel}`} className="ln" />
      <NLabel x={x} y={472} anchor="start" tone="ink">
        INBOUND · ERP → app
      </NLabel>

      <NNode
        x={x}
        y={484}
        w={w}
        h={h1}
        tone="ext"
        title="ERP webhook"
        lines={["POST, unsolicited"]}
      />
      <Edge id={id} d={`M ${cx} 530 V 554`} />
      <NNode x={x} y={554} w={w} h={h1} title="API-key validator" lines={["401 otherwise"]} />
      <Edge id={id} d={`M ${cx} 600 V 624`} />
      <NNode x={x} y={624} w={w} h={h1} title="Webhook processor" lines={["queued job"]} />
      <Edge id={id} d={`M ${cx} 670 V 694`} />
      <NNode x={x} y={694} w={w} h={h1} title="Local upsert" lines={["match on remote id"]} />

      <Edge id={id} d="M 40 776 V 740" />
      <NLabel x={48} y={762} anchor="start">
        upsert
      </NLabel>
      {/* The eight pulls, re-wrapped to five lines. The widest of the original
          three ("vendors · visits · salespeople", 30 characters) is ~194 units
          at size 11 and would sit 3 units off the 200-unit box's stroke; no
          item is renamed or dropped, only the line breaks moved. h=108 is what
          five 15-unit lines plus the heading need. */}
      <NNode
        x={x}
        y={776}
        w={w}
        h={108}
        title="8 scheduled pulls"
        lines={[
          "products · stock",
          "categories",
          "units of measure",
          "locations · vendors",
          "visits · salespeople",
        ]}
      />

      {/* Every direction is recorded, so the dashed hop starts at Local upsert
          (mid-height 717) and runs the channel past the pulls to SyncRun. */}
      <Edge
        id={id}
        kind="dash"
        d={`M ${right} 717 H 212 Q ${chan} 717 ${chan} 723 V 926 Q ${chan} 932 212 932 H ${right}`}
      />
      <NNode
        x={x}
        y={902}
        w={w}
        h={h2}
        title="SyncRun"
        lines={["one row per push,", "webhook, pull"]}
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
export function ErpSyncDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("@container", className)}>
      <Wide />
      <Narrow />
    </div>
  );
}
