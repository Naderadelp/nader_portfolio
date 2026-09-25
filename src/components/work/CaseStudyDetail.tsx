import type { CaseStudy, ScreenShot } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { PhoneStrip } from "@/components/site/PhoneStrip";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { MetricCallout } from "@/components/ui/MetricCallout";
import { TechTagList } from "@/components/ui/TechTag";
import { DiagramById } from "./DiagramById";
import { ScreenshotList } from "./ScreenshotList";

interface CaseStudyDetailProps {
  study: CaseStudy;
  /** Authorship line, stated plainly. Every figure is countable. */
  role: string;
  secondaryMetrics: readonly { value: string; label: string }[];
  /** Phone captures, when the case study has a user-facing surface. */
  phones?: {
    items: readonly ScreenShot[];
    heading: string;
    label: string;
    note?: string;
  };
  /** Desktop captures, when there are any that can be shown. */
  screens?: readonly ScreenShot[];
}

/** Problem → Constraint → Approach → Trade-off → Outcome, then the evidence. */
export function CaseStudyDetail({
  study,
  role,
  secondaryMetrics,
  phones,
  screens = [],
}: CaseStudyDetailProps) {
  return (
    <>
      <p className="mt-5 inline-flex max-w-measure border-l-2 border-accent bg-accent-soft py-1.5 pl-3 pr-4 font-mono text-label text-fg-secondary">
        {role}
      </p>

      <Reveal>
        <div className="mt-12 max-w-measure space-y-8">
          {(
            [
              ["Problem", study.narrative.problem],
              ["Constraint", study.narrative.constraint],
              ["Approach", study.narrative.approach],
              ["Trade-off", study.narrative.tradeoff],
              ["Outcome", study.narrative.outcome],
            ] as const
          ).map(([label, paragraphs]) => (
            <section key={label} aria-labelledby={`${label}-heading`}>
              <h2
                id={`${label}-heading`}
                className="font-mono text-micro uppercase text-accent"
              >
                {label}
              </h2>
              <div className="mt-2.5 space-y-4 text-fg-secondary">
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <MetricCallout {...study.metric} className="mt-12 max-w-measure" />

        {secondaryMetrics.length ? (
          <dl className="mt-6 grid max-w-measure grid-cols-2 gap-x-6 gap-y-5 border-t border-hairline pt-6 sm:grid-cols-3">
            {secondaryMetrics.map((m) => (
              <div key={m.label}>
                <dt className="font-mono text-micro uppercase text-fg-muted">
                  {m.label}
                </dt>
                <dd className="mt-1 font-mono text-lg text-fg">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Reveal>

      {study.diagramId ? (
        <Reveal>
          <figure className="mt-10 border border-hairline bg-surface/40 p-4 sm:p-6">
            <DiagramById id={study.diagramId} className="w-full" />
          </figure>
        </Reveal>
      ) : null}

      {phones ? (
        <div className="mt-12">
          <PhoneStrip {...phones} headingAs="h2" />
        </div>
      ) : null}

      {screens.length > 0 ? (
        <section aria-labelledby="screens-heading" className="mt-14">
          <h2
            id="screens-heading"
            className="font-mono text-micro uppercase text-fg-muted"
          >
            Screens
          </h2>
          <ScreenshotList shots={screens} className="mt-6" />
        </section>
      ) : null}

      {study.code ? (
        <CodeBlock {...study.code} className="mt-10 max-w-measure" />
      ) : null}

      <TechTagList
        items={study.tech}
        className="mt-10"
        label={`${study.title} — technologies`}
      />
    </>
  );
}
