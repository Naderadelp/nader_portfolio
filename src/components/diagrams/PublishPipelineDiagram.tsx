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
  // 240 units wide (see NARROW in primitives) so the drawing scales UP on a
  // phone instead of down. Everything below is laid out against that budget:
  //   8 .. 208   the single column of boxes (200 units ≈ 30 characters at 11)
  //   218        the one vertical channel both loop-backs run in
  //   232        the baseline rotated labels hang from, glyphs ≈ 224..235
  const x = 8;
  const w = 200;
  const cx = x + w / 2; // 108
  const right = x + w; // 208, where a loop-back leaves or re-enters the column
  const chan = 218; // loop-back channel, 10 units clear of the boxes
  const chanLabel = 232; // rotated-label baseline, 5 units clear of the channel

  // Box heights at the narrow scale: a heading plus one sub-line needs 46
  // units to keep 6 units of breathing room above the cap and below the
  // descender; a heading plus two needs 60. Below that the text touches the
  // stroke, which reads as a mistake rather than as density.
  const h1 = 46;
  const h2 = 60;

  return (
    <DiagramFrame
      id={id}
      viewBox={`0 0 ${NARROW_W} 816`}
      title={TITLE}
      desc={DESC}
      className="block max-w-[27rem] @4xl:hidden"
    >
      <NNode x={x} y={16} w={w} h={h1} title="Listing edited" lines={["property updated"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 62 V 86`} />

      <NNode
        x={x}
        y={86}
        w={w}
        h={h1}
        title="ReadinessService"
        lines={["gate · 22 blocking reasons"]}
      />
      <Edge id={id} kind="dash" d={`M ${cx} 132 V 168`} />
      <NLabel x={cx + 8} y={154} anchor="start">
        blocked
      </NLabel>
      {/* Re-wrapped, not reworded: "blockers returned to the editor" is 31
          characters, and 31 × ~0.59em at size 11 overruns a 200-unit box. */}
      <NNode
        x={x}
        y={168}
        w={w}
        h={h2}
        tone="note"
        title="nothing is sent"
        lines={["blockers returned to", "the editor"]}
      />

      {/* happy path steps around the refusal: out of the gate at its mid-height
          (109), down the channel, back into PayloadBuilder at its mid (275) */}
      <Edge
        id={id}
        kind="accent"
        d={`M ${right} 109 H 212 Q ${chan} 109 ${chan} 115 V 269 Q ${chan} 275 212 275 H ${right}`}
      />
      <NLabel x={chanLabel} y={192} rotate={-90} tone="accent">
        passes gate
      </NLabel>

      <NNode x={x} y={252} w={w} h={h1} title="PayloadBuilder" lines={["portal-shaped payload"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 298 V 322`} />

      <NNode x={x} y={322} w={w} h={h1} title="PublishJob" lines={["queued"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 368 V 382`} marker={false} />
      <NLabel x={cx} y={400} size={NARROW.title} tone="ink">
        lockForUpdate
      </NLabel>
      <NLabel x={cx} y={416}>
        one publish at a time
      </NLabel>
      <Edge id={id} kind="accent" d={`M ${cx} 424 V 444`} />

      <NNode x={x} y={444} w={w} h={h1} title="RateLimitAware" lines={["Client"]} />
      <Edge id={id} kind="accent" d={`M ${cx} 490 V 514`} />

      <NNode
        x={x}
        y={514}
        w={w}
        h={h1}
        tone="ext"
        title="External Portal API"
        lines={["pushes nothing back"]}
      />

      {/* 429 back into the queue. Shares the channel with the gate bypass above
          because the two never overlap vertically: the bypass lives in 109-275,
          this one in 345-537. */}
      <Edge
        id={id}
        kind="dash"
        d={`M ${right} 537 H 212 Q ${chan} 537 ${chan} 531 V 351 Q ${chan} 345 212 345 H ${right}`}
      />
      <NLabel x={chanLabel} y={441} rotate={-90}>
        429 · retry_after · backoff
      </NLabel>

      {/* reconcile */}
      <Edge id={id} kind="dash" d="M 40 560 V 596" />
      <NLabel x={48} y={582} anchor="start">
        reads portal
      </NLabel>
      <NNode
        x={x}
        y={596}
        w={w}
        h={h1}
        title="Hourly reconcile sweep"
        lines={["scheduled command"]}
      />
      <Edge id={id} d={`M ${cx} 642 V 666`} />
      <NNode x={x} y={666} w={w} h={h1} title="PublicationState" lines={["corrected locally"]} />

      <NLabel x={x} y={742} anchor="start">
        The portal pushes nothing back —
      </NLabel>
      <NLabel x={x} y={758} anchor="start">
        the sweep is the only feedback.
      </NLabel>

      <Legend
        x={x}
        y={786}
        size={NARROW.label}
        stacked
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
