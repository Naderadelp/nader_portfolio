import { Reveal } from "@/components/layout/Reveal";
import { cn } from "@/components/ui/cn";

type StepKind = "queued" | "ok" | "refused" | "waiting" | "sweep";

interface Step {
  /** Mono time offset shown in the left gutter. */
  at: string;
  title: string;
  detail: React.ReactNode;
  kind: StepKind;
}

/**
 * A machine token inside prose — a status code, a header name, a class name.
 *
 * `tone` binds the word to the colour of the step it belongs to, so the `429`
 * in the sentence is the same vermillion as the dot on the rail beside it.
 * This is the cheapest legibility device there is: it removes the need for a
 * legend, because the reader matches word to mark without being told to.
 */
function T({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "ok" | "refused" | "waiting" | "sweep";
}) {
  const colour =
    tone === "ok"
      ? "text-ok"
      : tone === "refused"
        ? "text-refused"
        : tone === "waiting"
          ? "text-waiting"
          : tone === "sweep"
            ? "text-accent"
            : "text-fg";

  return <code className={cn("font-mono text-[0.95em]", colour)}>{children}</code>;
}

/**
 * The publishing pipeline from the property-portal case study, told as a
 * sequence.
 *
 * Everything here is true of the real subsystem: the readiness check reports
 * every blocker rather than the first, the client honours `retry_after` on a
 * 429, the sync path takes a `lockForUpdate` so two concurrent publishes
 * cannot create a duplicate listing, and the hourly sweep exists because the
 * portal has no way to tell us a listing expired.
 */
const STEPS: readonly Step[] = [
  {
    at: "+0ms",
    title: "PublishListingJob queued",
    detail:
      "Dispatched to the queue rather than run inline, so the agent's request is not holding a connection open across a third-party API call.",
    kind: "queued",
  },
  {
    at: "+180ms",
    title: "Readiness check — 22 reasons evaluated",
    detail:
      "Every blocker is reported at once, not just the first, and each one names the form field to fix. Fourteen further cases were deleted once validation made them unreachable.",
    kind: "queued",
  },
  {
    at: "+240ms",
    title: "POST /listings → 429 Too Many Requests",
    detail: (
      <>
        Publishing a whole project&rsquo;s worth of units reaches the portal&rsquo;s
        rate limit. The response carries{" "}
        <T tone="refused">retry_after: 30</T>.
      </>
    ),
    kind: "refused",
  },
  {
    at: "+30s",
    title: "Backoff — the client waits what it was told to wait",
    detail:
      "Not a fixed sleep and not an immediate retry. The portal named a number; honouring it is the difference between a queue that drains and one that gets throttled harder.",
    kind: "waiting",
  },
  {
    at: "+30.4s",
    title: "Retry → 201 Created",
    detail: (
      <>
        The remote reference is written back under <T>lockForUpdate</T>, because
        two concurrent publishes of the same listing would otherwise create a
        duplicate on the portal and burn the reference.
      </>
    ),
    kind: "ok",
  },
  {
    at: "+1h",
    title: "ReconcileListingsCommand runs",
    detail:
      "The portal sends no webhooks. It cannot tell us anything, so once an hour we ask it instead — the only way expired and rejected are reachable at all.",
    kind: "sweep",
  },
  {
    at: "+1h",
    title: "Portal says expired — local state corrected",
    detail: (
      <>
        <T>PublicationState</T> moves <T tone="ok">active</T> →{" "}
        <T tone="refused">expired</T>. A guess that is never corrected turns
        into a lie, and this is the sweep that stops it becoming one.
      </>
    ),
    kind: "ok",
  },
];

const KIND_STYLES: Record<StepKind, { dot: string; at: string }> = {
  queued: { dot: "bg-fg-muted", at: "text-fg-muted" },
  ok: { dot: "bg-ok", at: "text-ok" },
  refused: { dot: "bg-refused", at: "text-refused" },
  waiting: { dot: "bg-waiting", at: "text-waiting" },
  sweep: { dot: "bg-accent", at: "text-accent" },
};

/** Seconds between one step lighting up and the next. */
const STEP_INTERVAL = 1.15;

/**
 * The site's one set-piece.
 *
 * Built out of real DOM rather than SVG on purpose. Text inside an SVG does
 * not reflow, does not scale with the reader's font size, and cannot be
 * selected — and this project has already shipped one set of diagrams whose
 * labels rendered at roughly five pixels because a wide viewBox landed in a
 * narrow column. An ordered list of steps has none of those problems, reads
 * correctly in a screen reader, and degrades to a plain legible list the
 * moment animation is switched off.
 *
 * The animation is pure CSS: each row carries its index as a custom property
 * and derives its own `animation-delay` from it, so there is no timer, no
 * state, and nothing to hydrate.
 */
export function PipelineFigure() {
  const cycle = STEPS.length * STEP_INTERVAL + 2.5;

  return (
    <section
      id="pipeline"
      aria-labelledby="pipeline-heading"
      className="relative border-y border-hairline bg-bg-sunken/40"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <Reveal>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="font-mono text-micro uppercase text-accent"
            >
              ◆
            </span>
            <span className="font-mono text-micro uppercase text-fg-muted">
              One publish, start to finish
            </span>
          </div>

          <h2
            id="pipeline-heading"
            className="mt-6 max-w-3xl text-headline font-semibold text-fg"
          >
            The agent got their answer in 41&nbsp;milliseconds.{" "}
            <span className="text-accent-gradient">
              Everything that matters happened afterwards.
            </span>
          </h2>
        </Reveal>

        {/* ---------------- the part the caller sees ---------------- */}
        <Reveal delay={60}>
          <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-label">
            <span className="border border-hairline bg-surface px-3 py-2 text-fg-secondary">
              POST /units/8412/publish
            </span>
            <span aria-hidden="true" className="text-fg-muted">
              →
            </span>
            <span className="border border-ok/40 bg-ok/10 px-3 py-2 text-ok">
              202 Accepted · 41ms
            </span>
            <span className="text-fg-muted">the caller is already gone</span>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
            <span className="font-mono text-micro uppercase text-fg-muted">
              The request ends here
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
          </div>
        </Reveal>

        {/* ---------------- the part nobody sees ---------------- */}
        <ol className="relative mt-12">
          {/* The rail, plus a travelling highlight that runs its length. */}
          <span
            aria-hidden="true"
            className="absolute left-[4.75rem] top-1 h-full w-px bg-hairline sm:left-[6.5rem]"
          />
          <span
            aria-hidden="true"
            style={{ "--cycle": `${cycle}s` } as React.CSSProperties}
            className="rail-scan absolute left-[4.75rem] top-1 h-full w-px sm:left-[6.5rem]"
          />

          {STEPS.map((step, index) => {
            const styles = KIND_STYLES[step.kind];
            return (
              <li
                key={step.title}
                style={
                  {
                    "--i": index,
                    "--cycle": `${cycle}s`,
                  } as React.CSSProperties
                }
                className="pipeline-step relative grid grid-cols-[4.75rem_1fr] gap-x-6 pb-10 sm:grid-cols-[6.5rem_1fr] sm:gap-x-8"
              >
                {/* pr-4 keeps the right-aligned label clear of the node dot,
                    which sits on the column's right edge. Without it the unit
                    is drawn underneath the dot: "+180ms" rendered as "+180m".
                    Not uppercased — "ms" and "s" are SI units and "+180MS" is
                    simply wrong. */}
                <span
                  className={cn(
                    "pr-4 pt-0.5 text-right font-mono text-micro",
                    styles.at,
                  )}
                >
                  {step.at}
                </span>

                {/* Node on the rail. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "step-dot absolute left-[4.75rem] top-1.5 size-2 -translate-x-1/2 rounded-full ring-4 ring-bg sm:left-[6.5rem]",
                    styles.dot,
                  )}
                />

                <div>
                  <h3 className="font-mono text-label text-fg">{step.title}</h3>
                  <p className="mt-2 max-w-measure text-sm text-fg-secondary">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <Reveal>
          <p className="mt-2 max-w-measure border-l-2 border-accent pl-4 text-fg-secondary">
            An hour of staleness, accepted on purpose. The portal offers no push
            channel, and a tighter schedule buys freshness with rate-limit
            budget that is better spent publishing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
