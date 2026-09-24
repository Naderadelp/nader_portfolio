import { MainColumn } from "@/components/layout/MainColumn";
import { Reveal } from "@/components/layout/Reveal";
import { Section } from "@/components/layout/Section";
import { Sidebar } from "@/components/layout/Sidebar";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { MetricCallout } from "@/components/ui/MetricCallout";
import { TechTagList } from "@/components/ui/TechTag";
import {
  DerivedStateDiagram,
  ErpSyncDiagram,
  PublishPipelineDiagram,
} from "@/components/diagrams";
import {
  aboutParagraphs,
  adaptedCarTracker as carTracker,
  adaptedCaseStudies as caseStudies,
  adaptedContact as contact,
  adaptedExperience as experience,
  adaptedProfile as profile,
  adaptedRepos as repos,
  adaptedStack as stack,
  caseStudyRoles,
  cvLinks,
  mobileScreenshots,
  secondaryMetrics,
} from "@/lib/portfolio";

/**
 * Row inside a `group/list`. While any row is hovered or holds focus every row
 * dims; the important-flagged rules pull the active one back to full opacity.
 */
const DIMMING_ROW = [
  "group/row transition-opacity duration-200 ease-out motion-reduce:transition-none",
  "group-has-[li:hover]/list:opacity-55",
  "group-has-[li:focus-within]/list:opacity-55",
  "hover:opacity-100! focus-within:opacity-100!",
].join(" ");

/** Diagram component per case-study `diagramId`. */
const DIAGRAMS = {
  "publish-pipeline": PublishPipelineDiagram,
  "erp-sync": ErpSyncDiagram,
  "derived-state": DerivedStateDiagram,
} as const;

function Diagram({ id }: { id: string }) {
  const Component = DIAGRAMS[id as keyof typeof DIAGRAMS];
  if (!Component) return null;

  return (
    <figure className="mt-8">
      <Component className="w-full" />
    </figure>
  );
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:flex lg:gap-12 lg:px-12">
      <Sidebar profile={profile} />

      <MainColumn
        footer={
          <footer className="border-t border-hairline py-10">
            <p className="max-w-measure text-sm text-fg-secondary">
              Built with Next.js and Tailwind CSS, statically exported. Set in
              Geist Sans and Geist Mono. Diagrams hand-drawn as inline SVG.
            </p>
          </footer>
        }
      >
        {/* --- About -------------------------------------------------- */}
        <Section id="about" title="About">
          <Reveal>
            <div className="max-w-measure space-y-4 text-fg-secondary">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </Section>

        {/* --- Experience --------------------------------------------- */}
        <Section id="experience" title="Experience">
          <ol className="group/list">
            {experience.map((role, index) => (
              <li key={role.id} className={DIMMING_ROW}>
                <Reveal delay={index * 40}>
                  <article className="grid gap-2 py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                    <p className="pt-1 font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                      {role.period}
                    </p>
                    <div>
                      <h3 className="text-base font-semibold text-fg transition-colors duration-200 group-hover/row:text-accent motion-reduce:transition-none">
                        {role.title}
                        <span className="text-fg-secondary"> · {role.company}</span>
                      </h3>
                      <p className="mt-2 max-w-measure text-fg-secondary">
                        {role.summary}
                      </p>
                      <ul className="mt-3 max-w-measure list-disc space-y-1.5 pl-5 text-fg-secondary marker:text-fg-muted">
                        {role.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                      <TechTagList
                        items={role.tech}
                        className="mt-4"
                        label={`${role.company} — technologies`}
                      />
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        {/* --- Selected Work ------------------------------------------ */}
        <Section id="work" title="Selected Work">
          <div className="space-y-20">
            {caseStudies.map((study, index) => (
              <Reveal key={study.id} as="article" delay={index * 40}>
                <h3 className="text-lg font-semibold text-fg">{study.title}</h3>

                {study.subtitle ? (
                  <p className="mt-1.5 max-w-measure text-fg-secondary">
                    {study.subtitle}
                  </p>
                ) : null}

                {/* Authorship, stated plainly. Every figure is countable.
                    Set in mono but not uppercased: it is a sentence, and two
                    wrapped lines of tracked-out capitals are hard work. */}
                <p className="mt-3 max-w-measure font-mono text-label text-fg-muted">
                  {caseStudyRoles[study.id]}
                </p>

                {/* The label is a heading, not a run-in span: each of these
                    carries 1-3 paragraphs, and set inline they produced one
                    unbroken 40-line block per section. */}
                <div className="mt-8 max-w-measure space-y-8">
                  {(
                    [
                      ["Problem", study.narrative.problem],
                      ["Constraint", study.narrative.constraint],
                      ["Approach", study.narrative.approach],
                      ["Trade-off", study.narrative.tradeoff],
                      ["Outcome", study.narrative.outcome],
                    ] as const
                  ).map(([label, paragraphs]) => (
                    <div key={label}>
                      <h4 className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                        {label}
                      </h4>
                      <div className="mt-2.5 space-y-4 text-fg-secondary">
                        {paragraphs.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <MetricCallout {...study.metric} className="mt-8 max-w-measure" />

                {secondaryMetrics[study.id]?.length ? (
                  <dl className="mt-4 flex max-w-measure flex-wrap gap-x-8 gap-y-3">
                    {secondaryMetrics[study.id].map((m) => (
                      <div key={m.label}>
                        <dt className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                          {m.label}
                        </dt>
                        <dd className="mt-0.5 font-mono text-base text-fg">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {study.diagramId ? <Diagram id={study.diagramId} /> : null}

                {study.code ? (
                  <CodeBlock {...study.code} className="mt-8 max-w-measure" />
                ) : null}

                <TechTagList
                  items={study.tech}
                  className="mt-6"
                  label={`${study.title} — technologies`}
                />
              </Reveal>
            ))}
          </div>

          {repos.length > 0 ? (
            <Reveal className="mt-16">
              <h3 className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                Also built
              </h3>
              <ul className="group/list mt-4 space-y-5">
                {repos.map((repo) => (
                  <li key={repo.name} className={DIMMING_ROW}>
                    {repo.href ? (
                      <ExternalLink
                        href={repo.href}
                        className="font-medium no-underline"
                      >
                        {repo.name}
                      </ExternalLink>
                    ) : (
                      <span className="font-medium text-fg">{repo.name}</span>
                    )}
                    <p className="mt-1 max-w-measure text-fg-secondary">
                      {repo.description}
                    </p>
                    <TechTagList
                      items={repo.tech}
                      className="mt-2"
                      label={`${repo.name} — technologies`}
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </Section>

        {/* --- Stack --------------------------------------------------- */}
        <Section id="stack" title="Stack">
          <Reveal>
            <dl className="max-w-measure space-y-5">
              {stack.map((group) => (
                <div key={group.label}>
                  <dt className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                    {group.label}
                  </dt>
                  <dd className="mt-2">
                    <TechTagList
                      items={group.items}
                      label={`${group.label} technologies`}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Section>

        {/* --- car-tracker --------------------------------------------- */}
        <Section id="car-tracker" title={carTracker.title} eyebrow="Own project">
          <Reveal>
            <p className="max-w-measure text-fg-secondary">
              {carTracker.description}
            </p>
            {carTracker.bullets.length > 0 ? (
              <ul className="mt-4 max-w-measure list-disc space-y-1.5 pl-5 text-fg-secondary marker:text-fg-muted">
                {carTracker.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            <TechTagList
              items={carTracker.tech}
              className="mt-5"
              label="car-tracker — technologies"
            />
            <p className="mt-4">
              <ExternalLink href={carTracker.repoUrl}>
                View the repository
              </ExternalLink>
            </p>
          </Reveal>

          {/* The mobile client. Portrait captures, so they run as a
              horizontally scrolling strip rather than eight full-width images.
              The strip takes focus and has an accessible name: a scroll
              container that keyboard users cannot reach is a WCAG 2.1.1
              failure, which is exactly what the code blocks were caught on. */}
          <div className="mt-10">
            <h3 className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
              On the phone
            </h3>
            {/* The scroll container is the div, not the <ul>: putting
                role="region" on the list overrides its implicit list role and
                orphans every <li>. */}
            <div
              tabIndex={0}
              role="region"
              aria-label="car-tracker mobile screenshots, scrolls horizontally"
              className="mt-4 overflow-x-auto pb-4"
            >
            <ul className="flex snap-x snap-mandatory gap-5">
              {mobileScreenshots.map((shot) => (
                <li
                  key={shot.src}
                  className="w-[13.5rem] shrink-0 snap-start sm:w-[15rem]"
                >
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-xl border border-hairline"
                    />
                    {shot.caption ? (
                      <figcaption className="mt-3 text-sm text-fg-secondary">
                        {shot.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                </li>
              ))}
            </ul>
            </div>
          </div>

          {/* The admin panel, captured against a locally seeded database. */}
          <h3 className="mt-14 font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
            Admin panel
          </h3>
          <ul className="mt-4 space-y-10">
            {carTracker.screenshots.map((shot, index) => (
              <li key={shot.src}>
                <Reveal delay={index * 40}>
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-lg border border-hairline"
                    />
                    {shot.caption ? (
                      <figcaption className="mt-3 font-mono text-label text-fg-muted">
                        {shot.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* --- Contact -------------------------------------------------- */}
        <Section id="contact" title={contact.heading}>
          <Reveal>
            <p className="max-w-measure text-fg-secondary">{contact.body}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CopyEmailButton email={contact.email} />
              <ExternalLink
                href={`mailto:${contact.email}`}
                className="no-underline"
              >
                Open in mail client
              </ExternalLink>
            </div>

            <div className="mt-8">
              <h3 className="font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
                Curriculum vitae
              </h3>
              <ul className="mt-3 space-y-2">
                {cvLinks.map((cv) => (
                  <li key={cv.id}>
                    <a
                      href={cv.href}
                      download
                      className="font-medium text-fg underline decoration-hairline underline-offset-4 transition-colors hover:text-accent hover:decoration-accent motion-reduce:transition-none"
                    >
                      {cv.label}
                    </a>
                    <span className="text-fg-secondary"> — {cv.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Section>
      </MainColumn>
    </div>
  );
}
