import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { NavItem } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { PhoneStrip } from "@/components/site/PhoneStrip";
import { PipelineFigure } from "@/components/site/PipelineFigure";
import { SiteNav } from "@/components/site/SiteNav";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { TechTagList } from "@/components/ui/TechTag";
import { CaseStudyDetail } from "@/components/work/CaseStudyDetail";
import { ScreenshotList } from "@/components/work/ScreenshotList";
import { contributions } from "@/content/contributions";
import {
  adaptedCarTracker as carTracker,
  adaptedCaseStudies as caseStudies,
  adaptedProfile as profile,
  caseStudyRoles,
  caseStudyScreenshots,
  erpScreenshots,
  getWorkCard,
  mobileScreenshots,
  secondaryMetrics,
  workCards,
} from "@/lib/portfolio";

/**
 * One page per project, all generated at build time.
 *
 * `dynamicParams = false` makes any slug not in `workCards` a 404 rather than
 * something the build would try to render on request — there is no server to
 * render it on.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return workCards.map((card) => ({ slug: card.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const card = getWorkCard((await params).slug);
  if (!card) return {};
  return {
    title: `${card.title} — ${profile.name}`,
    description: card.summary,
  };
}

const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

/** Bordered so it reads as the way back, not as a caption. */
const BACK_LINK =
  "inline-flex items-center gap-2 border border-hairline-strong bg-surface/60 px-3.5 py-2 font-mono text-label text-fg no-underline transition-colors duration-200 hover:border-accent hover:text-accent motion-reduce:transition-none";

const NAV_ITEMS: readonly NavItem[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const card = getWorkCard(slug);
  if (!card) notFound();

  const index = workCards.indexOf(card);
  const next = workCards[(index + 1) % workCards.length];

  return (
    <>
      <SiteNav
        monogram="NA"
        name={profile.name}
        items={NAV_ITEMS}
        sectionIds={[]}
        socials={profile.socials}
        hrefBase="/"
      />

      <div aria-hidden="true" className="page-glow" />
      <div aria-hidden="true" className="page-texture" />

      <main id="content" className="relative z-10 pb-24 pt-28 sm:pt-32">
        <div className={CONTAINER}>
          <div id="top">
            <Link href="/#work" className={BACK_LINK}>
              <span aria-hidden="true">←</span> All work
            </Link>

            <p className="mt-10 flex items-center gap-3 font-mono text-label uppercase text-accent">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="h-px w-10 bg-accent-line" />
              <span className="text-fg-secondary">{card.kindLabel}</span>
            </p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-fg">
              {card.title}
            </h1>
            <p className="mt-4 max-w-measure text-lg text-fg-secondary">
              {card.summary}
            </p>
          </div>

          {card.kind === "case-study" ? <CaseStudyBody slug={slug} /> : null}
          {card.kind === "contribution" ? <ContributionBody slug={slug} /> : null}
          {card.kind === "own-project" ? <CarTrackerBody /> : null}
        </div>

        {/* One publish, end to end — the same figure as on the home page,
            where it makes the About section's argument. Here it is the
            evidence for this project. Full-bleed, so outside the column. */}
        {slug === "property-portal-pipeline" ? (
          <div className="mt-20">
            <PipelineFigure />
          </div>
        ) : null}

        <div className={CONTAINER}>
          <nav
            aria-label="More work"
            className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8"
          >
            <Link href="/#work" className={BACK_LINK}>
              <span aria-hidden="true">←</span> All work
            </Link>
            <Link
              href={`/work/${next.slug}`}
              className="group text-right no-underline"
            >
              <span className="block font-mono text-micro uppercase text-fg-muted">
                Next
              </span>
              <span className="font-medium text-fg transition-colors group-hover:text-accent motion-reduce:transition-none">
                {next.title} →
              </span>
            </Link>
          </nav>
        </div>
      </main>
    </>
  );
}

function CaseStudyBody({ slug }: { slug: string }) {
  const study = caseStudies.find((s) => s.id === slug);
  if (!study) return null;

  return (
    <CaseStudyDetail
      study={study}
      role={caseStudyRoles[slug]}
      secondaryMetrics={secondaryMetrics[slug] ?? []}
      screens={caseStudyScreenshots[slug]}
      phones={
        // The only case study with a user-facing surface that can be shown.
        // See the note on `erpScreenshots` for what was edited out.
        slug === "erp-bidirectional-sync"
          ? {
              items: erpScreenshots,
              heading: "What the field agents see",
              label: "Field sales app screens, scrolls horizontally",
              note: "Client not named, and edited before publishing: the account name, the logo and the one real vendor name are covered, and product branding is blurred. Screens whose content was lists of real people were left out rather than redacted.",
            }
          : undefined
      }
    />
  );
}

function ContributionBody({ slug }: { slug: string }) {
  const item = contributions.find((c) => c.id === slug);
  if (!item) return null;

  return (
    <>
      {/* The limit of the claim, in the same place and the same treatment as
          the authorship line on a full case study. */}
      <p className="mt-5 max-w-measure border-l-2 border-hairline-strong bg-surface/50 py-2 pl-3 pr-4 font-mono text-label text-fg-secondary">
        {item.authorship}
      </p>

      <Reveal>
        <div className="mt-12 max-w-measure space-y-4 text-fg-secondary">
          {item.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Reveal>

      {item.screenshots.length > 0 ? (
        <section aria-labelledby="screens-heading" className="mt-14">
          <h2
            id="screens-heading"
            className="font-mono text-micro uppercase text-fg-muted"
          >
            Screens
          </h2>
          <ScreenshotList shots={item.screenshots} className="mt-6" />
        </section>
      ) : null}

      <TechTagList
        items={item.tech}
        className="mt-10"
        label={`${item.title} — technologies`}
      />
    </>
  );
}

function CarTrackerBody() {
  return (
    <>
      <p className="mt-5 max-w-measure font-mono text-label text-fg-muted">
        Built to be shown — the production work is under NDA.
      </p>

      <Reveal>
        {carTracker.bullets.length > 0 ? (
          <ul className="mt-10 max-w-measure list-disc space-y-2 pl-5 text-fg-secondary marker:text-accent">
            {carTracker.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}
        <TechTagList
          items={carTracker.tech}
          className="mt-6"
          label="car-tracker — technologies"
        />
        <p className="mt-5">
          <ExternalLink href={carTracker.repoUrl}>View the repository</ExternalLink>
        </p>
      </Reveal>

      <div className="mt-14">
        <PhoneStrip
          items={mobileScreenshots}
          heading="On the phone"
          label="car-tracker mobile screenshots, scrolls horizontally"
          headingAs="h2"
        />
      </div>

      {/* The admin panel, captured against a locally seeded database. */}
      <section aria-labelledby="admin-heading" className="mt-16">
        <h2
          id="admin-heading"
          className="font-mono text-micro uppercase text-fg-muted"
        >
          Admin panel
        </h2>
        <ScreenshotList shots={carTracker.screenshots} className="mt-6" />
      </section>
    </>
  );
}
