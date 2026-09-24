import { cn } from "@/components/ui/cn";
import { DiagramFrame, Edge, Label, Legend, Node } from "./primitives";

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
  const x = 16;
  const w = 272;
  const cx = 152;

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 360 980"
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      <Label x={16} y={20} anchor="start" tone="ink">
        OUTBOUND · app → ERP
      </Label>

      <Node x={x} y={34} w={w} h={48} title="Model write" lines={["create / update"]} />
      <Edge id={id} d={`M ${cx} 82 V 106`} />
      <Node x={x} y={106} w={w} h={52} tone="accent" title="Observer" lines={["saved() hook"]} />
      <Edge id={id} d={`M ${cx} 158 V 182`} />
      <Node x={x} y={182} w={w} h={48} title="PushJob" lines={["queued"]} />
      <Edge id={id} d={`M ${cx} 230 V 254`} />
      <Node x={x} y={254} w={w} h={48} title="ERP client" lines={["typed DTOs"]} />
      <Edge id={id} d={`M ${cx} 302 V 326`} />
      <Node x={x} y={326} w={w} h={48} tone="ext" title="ERP" lines={["remote system"]} />

      {/* ERP answers with a remote id, which is stored without firing model events */}
      <Edge id={id} kind="accent" d={`M ${cx} 374 V 390`} />
      <Node
        x={x}
        y={390}
        w={w}
        h={64}
        tone="accent"
        title="saveQuietly()"
        lines={["remote id stored", "no model events fire"]}
      />
      <Edge
        id={id}
        kind="accent"
        d="M 288 422 H 328 Q 336 422 336 414 V 140 Q 336 132 328 132 H 288"
      />
      <Label x={350} y={276} rotate={-90} tone="accent">
        no infinite sync loop
      </Label>

      <path d="M 16 478 H 344" className="ln" />
      <Label x={16} y={500} anchor="start" tone="ink">
        INBOUND · ERP → app
      </Label>

      <Node x={x} y={512} w={w} h={48} tone="ext" title="ERP webhook" lines={["POST, unsolicited"]} />
      <Edge id={id} d={`M ${cx} 560 V 584`} />
      <Node x={x} y={584} w={w} h={48} title="API-key validator" lines={["401 otherwise"]} />
      <Edge id={id} d={`M ${cx} 632 V 656`} />
      <Node x={x} y={656} w={w} h={48} title="Webhook processor" lines={["queued job"]} />
      <Edge id={id} d={`M ${cx} 704 V 728`} />
      <Node x={x} y={728} w={w} h={48} title="Local upsert" lines={["match on remote id"]} />

      <Edge id={id} d="M 60 800 V 776" />
      <Label x={70} y={792} anchor="start">
        upsert
      </Label>
      <Node
        x={x}
        y={800}
        w={w}
        h={88}
        title="8 scheduled pulls"
        lines={[
          "products · stock · categories",
          "units of measure · locations",
          "vendors · visits · salespeople",
        ]}
      />

      <Edge id={id} kind="dash" d="M 288 752 H 328 V 934 H 288" />
      <Node
        x={x}
        y={906}
        w={w}
        h={56}
        title="SyncRun"
        lines={["one row per push, webhook, pull"]}
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
