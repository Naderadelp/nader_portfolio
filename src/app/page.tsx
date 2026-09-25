import type { NavItem, SectionId } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { Hero } from "@/components/site/Hero";
import { PipelineFigure } from "@/components/site/PipelineFigure";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteSection } from "@/components/site/SiteSection";
import { StackTicker } from "@/components/site/StackTicker";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { TechTagList } from "@/components/ui/TechTag";
import { WorkGrid } from "@/components/work/WorkGrid";
import { hero } from "@/content/profile";
import {
  aboutParagraphs,
  adaptedContact as contact,
  adaptedExperience as experience,
  adaptedProfile as profile,
  adaptedRepos as repos,
  adaptedStack as stack,
  cvLinks,
  workCards,
} from "@/lib/portfolio";

/** Every section the scroll-spy observes, in document order. */
const SECTION_IDS: readonly SectionId[] = [
  "about",
  "pipeline",
  "work",
  "experience",
  "stack",
  "contact",
];

const NAV_ITEMS: readonly NavItem[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

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

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <SiteNav
        monogram="NA"
        name={profile.name}
        items={NAV_ITEMS}
        sectionIds={SECTION_IDS}
        socials={profile.socials}
      />

      {/* Fixed grid, grain and glow. Decorative, never scrolls, never takes a
          pointer. Two layers because each needs both pseudo-elements. */}
      <div aria-hidden="true" className="page-glow" />
      <div aria-hidden="true" className="page-texture" />

      <main id="content" className="relative z-10">
        <Hero
          name={profile.name}
          headline={hero.headline as unknown as [string, string]}
          lead={hero.lead}
          availability={hero.availability}
          stats={hero.stats}
          portraitSrc={hero.portraitSrc}
          cvHref={profile.cvHref}
        />

        {/* --- About ---------------------------------------------------- */}
        <SiteSection
          id="about"
          index="01"
          eyebrow="About"
          title="Most of what I build runs after the response has already gone out."
          standfirst="Where I learned this, and what it taught me."
        >
          <Reveal>
            <div className="max-w-measure space-y-5 text-fg-secondary">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </SiteSection>

        {/* --- The signature figure -------------------------------------- */}
        <PipelineFigure />

        {/* --- Work ------------------------------------------------------ */}
        {/* Every project in one place: case studies, work inside shared
            codebases, and car-tracker. Each card opens the project's own page
            at /work/<slug>, so this section stays scannable. */}
        <SiteSection
          id="work"
          index="02"
          eyebrow="Work"
          title="Seven systems, from sole author to one feature in someone else’s."
          standfirst="Open any card for the problem, the trade-offs and the screens."
        >
          {/* How the authorship numbers were produced. Stated once, here. A
              figure with a method and a date attached is falsifiable, which is
              the entire difference between this and "led development of". */}
          <Reveal>
            <p className="mb-12 max-w-measure border border-hairline bg-surface/50 p-5 font-mono text-label text-fg-secondary">
              <span className="text-accent">Authorship,</span> on every card,
              was measured with <code className="text-fg">git blame</code> on
              24 and 25 September 2026 — surviving lines per author, across the
              files of each system. Work done by teammates is attributed to
              them, not counted here.
            </p>
          </Reveal>

          <WorkGrid cards={workCards} />

          {repos.length > 0 ? (
            <Reveal className="mt-20">
              <h3 className="font-mono text-micro uppercase text-fg-muted">
                Also built
              </h3>
              <ul className="group/list mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
                {repos.map((repo) => (
                  <li
                    key={repo.name}
                    className={`${DIMMING_ROW} bg-bg p-6 transition-colors hover:bg-surface`}
                  >
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
                    <p className="mt-2 text-fg-secondary">{repo.description}</p>
                    <TechTagList
                      items={repo.tech}
                      className="mt-4"
                      label={`${repo.name} — technologies`}
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </SiteSection>

        {/* --- Experience ------------------------------------------------ */}
        <SiteSection
          id="experience"
          index="03"
          eyebrow="Experience"
          title="A year and a half inside other people's modules."
          standfirst="Where the work happened, and what I owned."
        >
          {/* Centre spine on wide screens, left rail on narrow. */}
          <ol className="group/list relative">
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 h-full w-px bg-hairline sm:left-[9.5rem]"
            />
            {experience.map((role, index) => (
              <li key={role.id} className={`${DIMMING_ROW} relative`}>
                <Reveal delay={index * 40}>
                  <article className="grid gap-3 pb-14 pl-7 sm:grid-cols-[8.5rem_1fr] sm:gap-10 sm:pl-0">
                    <p className="pt-1 font-mono text-micro uppercase text-fg-muted sm:text-right">
                      {role.period}
                    </p>

                    {/* Node on the spine. */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 size-2 -translate-x-1/2 rounded-full bg-accent ring-4 ring-bg sm:left-[9.5rem]"
                    />

                    <div>
                      <h3 className="text-base font-semibold text-fg transition-colors duration-200 group-hover/row:text-accent motion-reduce:transition-none">
                        {role.title}
                        <span className="text-fg-secondary">
                          {" "}
                          · {role.company}
                        </span>
                      </h3>
                      <p className="mt-2 max-w-measure text-fg-secondary">
                        {role.summary}
                      </p>
                      <ul className="mt-4 max-w-measure list-disc space-y-2 pl-5 text-fg-secondary marker:text-accent">
                        {role.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                      <TechTagList
                        items={role.tech}
                        className="mt-5"
                        label={`${role.company} — technologies`}
                      />
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </SiteSection>

        {/* --- Stack ------------------------------------------------------ */}
        <SiteSection
          id="stack"
          index="04"
          eyebrow="Stack"
          title="What I actually use, and what I am only learning."
          standfirst="No percentages. No star ratings. The learning group says so."
        >
          <StackTicker groups={stack} />
        </SiteSection>

        {/* --- Contact ---------------------------------------------------- */}
        <SiteSection
          id="contact"
          index="05"
          eyebrow="Contact"
          title={contact.heading}
        >
          <Reveal>
            <p className="max-w-measure text-fg-secondary">{contact.body}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CopyEmailButton email={contact.email} />
              <ExternalLink
                href={`mailto:${contact.email}`}
                className="no-underline"
              >
                Open in mail client
              </ExternalLink>
            </div>

            <div className="mt-12">
              <h3 className="font-mono text-micro uppercase text-fg-muted">
                Curriculum vitae
              </h3>
              <ul className="mt-5 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
                {cvLinks.map((cv) => (
                  <li key={cv.id} className="bg-bg p-5">
                    <a
                      href={cv.href}
                      download
                      className="font-medium text-fg underline decoration-hairline underline-offset-4 transition-colors hover:text-accent hover:decoration-accent motion-reduce:transition-none"
                    >
                      {cv.label}
                    </a>
                    <p className="mt-1.5 text-sm text-fg-secondary">
                      {cv.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </SiteSection>

        <footer className="mx-auto w-full max-w-7xl border-t border-hairline px-5 py-10 sm:px-8 lg:px-12">
          <p className="max-w-measure text-sm text-fg-muted">
            Built with Next.js and Tailwind CSS, statically exported. Set in
            Geist Sans and Geist Mono. Diagrams hand-drawn as inline SVG.
          </p>
        </footer>
      </main>
    </>
  );
}
