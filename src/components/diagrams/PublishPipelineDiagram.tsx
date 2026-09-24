import { cn } from "@/components/ui/cn";
import { DiagramFrame, Edge, Label, Legend, Node } from "./primitives";

const TITLE = "Property portal publishing pipeline";

const DESC =
  "A listing edit enters ReadinessService, a gate with 22 possible blocking reasons: " +
  "on failure it returns the blockers and nothing is sent. A passing listing goes to " +
  "PayloadBuilder, then to a queued PublishJob, then through a rate-limit-aware client " +
  "to the external portal API. A 429 with retry_after sends the job back to the queue " +
  "with backoff. lockForUpdate on the sync path stops two concurrent publishes from " +
  "creating a duplicate property. Because the portal pushes nothing back, an hourly " +
  "scheduled reconcile sweep reads portal state and corrects the local PublicationState.";

/* ------------------------------------------------------------- wide (roomy) */

function Wide() {
  const id = "pp-w";
  const y = 92; // pipeline row top
  const h = 72;
  const mid = y + h / 2; // 128
  const w = 132;
  const xs = [16, 175, 334, 493, 652, 811];

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 960 520"
      title={TITLE}
      desc={DESC}
      className="hidden @4xl:block"
    >
      {/* the lockForUpdate guard, annotated onto the queue -> client hop */}
      <Node
        x={536}
        y={30}
        w={204}
        h={54}
        tone="soft"
        title="lockForUpdate"
        lines={["one publish at a time,", "never a duplicate property"]}
      />
      <Edge id={id} d="M 638 84 V 124" kind="dash" marker={false} />

      {/* happy path */}
      <Node x={xs[0]} y={y} w={w} h={h} title="Listing edited" lines={["property updated"]} />
      <Node x={xs[1]} y={y} w={w} h={h} title="Readiness" lines={["Service · gate"]} />
      <Node x={xs[2]} y={y} w={w} h={h} title="Payload" lines={["Builder"]} />
      <Node x={xs[3]} y={y} w={w} h={h} title="PublishJob" lines={["queued"]} />
      <Node x={xs[4]} y={y} w={w} h={h} title="RateLimitAware" lines={["Client"]} />
      <Node x={xs[5]} y={y} w={133} h={h} tone="ext" title="Portal API" lines={["external"]} />

      {xs.slice(0, 5).map((x) => (
        <Edge key={x} id={id} kind="accent" d={`M ${x + w} ${mid} H ${x + w + 27}`} />
      ))}

      {/* the gate refusing */}
      <Edge id={id} kind="dash" d="M 241 164 V 196" />
      <Label x={249} y={183} anchor="start">
        blocked
      </Label>
      <Node
        x={152}
        y={196}
        w={178}
        h={62}
        tone="note"
        title="22 blocking reasons"
        lines={["returned to the editor,", "nothing is sent"]}
      />

      {/* 429 back into the queue */}
      <Edge
        id={id}
        kind="dash"
        d="M 877 164 V 286 Q 877 296 867 296 H 569 Q 559 296 559 286 V 164"
      />
      <Label x={718} y={282}>
        429 / retry_after · backoff · re-queue
      </Label>

      {/* the portal never calls back, so we go and look */}
      <Edge id={id} kind="dash" d="M 910 164 V 372" />
      <Label x={924} y={268} rotate={-90}>
        reads portal state
      </Label>

      <path d="M 16 336 H 520" className="ln" />
      <Label x={16} y={328} anchor="start">
        no webhooks — the sweep is the only feedback
      </Label>

      <Label x={16} y={392} anchor="start">
        The portal never calls back.
      </Label>
      <Label x={16} y={408} anchor="start">
        Local PublicationState is
      </Label>
      <Label x={16} y={424} anchor="start">
        repaired from the portal&apos;s
      </Label>
      <Label x={16} y={440} anchor="start">
        own reading, hourly.
      </Label>

      <Node
        x={700}
        y={372}
        w={244}
        h={72}
        title="Hourly reconcile sweep"
        lines={["scheduled command", "reads portal truth"]}
      />
      <Node
        x={430}
        y={372}
        w={214}
        h={72}
        title="PublicationState"
        lines={["corrected locally"]}
      />
      <Edge id={id} d="M 700 408 H 644" />
      <Label x={672} y={398}>
        corrects
      </Label>

      <Legend x={16} y={486} accentLabel="happy path" dashLabel="failure · retry · reconcile" />
    </DiagramFrame>
  );
}

/* ---------------------------------------------------------- narrow (tight) */

function Narrow() {
  const id = "pp-n";
  const x = 16;
  const w = 272;
  const cx = 152;

  return (
    <DiagramFrame
      id={id}
      viewBox="0 0 360 880"
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      <Node x={x} y={20} w={w} h={48} title="Listing edited" lines={["property updated"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 68 V 96`} />

      <Node
        x={x}
        y={96}
        w={w}
        h={56}
        title="ReadinessService"
        lines={["gate · 22 blocking reasons"]}
      />
      <Edge id={id} kind="dash" d={`M ${cx} 152 V 186`} />
      <Label x={162} y={172} anchor="start">
        blocked
      </Label>
      <Node
        x={x}
        y={186}
        w={w}
        h={58}
        tone="note"
        title="nothing is sent"
        lines={["blockers returned to the editor"]}
      />

      {/* happy path steps around the refusal */}
      <Edge
        id={id}
        kind="accent"
        d="M 288 124 H 312 Q 320 124 320 132 V 282 Q 320 290 312 290 H 288"
      />
      <Label x={336} y={205} rotate={-90} tone="accent">
        passes gate
      </Label>

      <Node x={x} y={266} w={w} h={48} title="PayloadBuilder" lines={["portal-shaped payload"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 314 V 338`} />

      <Node x={x} y={338} w={w} h={52} title="PublishJob" lines={["queued"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 390 V 404`} marker={false} />
      <Label x={cx} y={420} size={10.5} tone="ink">
        lockForUpdate
      </Label>
      <Label x={cx} y={434}>
        one publish at a time
      </Label>
      <Edge id={id} kind="accent" d={`M ${cx} 442 V 462`} />

      <Node x={x} y={462} w={w} h={52} title="RateLimitAware" lines={["Client"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 514 V 538`} />

      <Node
        x={x}
        y={538}
        w={w}
        h={52}
        tone="ext"
        title="External Portal API"
        lines={["pushes nothing back"]}
      />

      {/* 429 back into the queue */}
      <Edge
        id={id}
        kind="dash"
        d="M 288 564 H 324 Q 332 564 332 556 V 372 Q 332 364 324 364 H 288"
      />
      <Label x={348} y={464} rotate={-90}>
        429 · retry_after · backoff
      </Label>

      {/* reconcile */}
      <Edge id={id} kind="dash" d="M 56 590 V 630" />
      <Label x={66} y={614} anchor="start">
        reads portal
      </Label>
      <Node
        x={x}
        y={630}
        w={w}
        h={58}
        title="Hourly reconcile sweep"
        lines={["scheduled command"]}
      />
      <Edge id={id} d={`M ${cx} 688 V 716`} />
      <Node x={x} y={716} w={w} h={58} title="PublicationState" lines={["corrected locally"]} />

      <Label x={16} y={806} anchor="start">
        The portal pushes nothing back —
      </Label>
      <Label x={16} y={822} anchor="start">
        the sweep is the only feedback.
      </Label>

      <Legend
        x={16}
        y={860}
        gap={132}
        accentLabel="happy path"
        dashLabel="failure · retry"
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
export function PublishPipelineDiagram({ className }: { className?: string }) {
  return (
    <div className={cn("@container", className)}>
      <Wide />
      <Narrow />
    </div>
  );
}
