import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/layout/Reveal";
import { NAV_ITEMS } from "@/components/site/nav-items";
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
  contactHref,
  erpScreenshots,
  getGlance,
  processContent,
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
  // A child's `openGraph` replaces the layout's rather than merging with it,
  // so the preview image is set here too: the project's own cover when it has
  // one, which makes a pasted link show the work rather than the portrait.
  const title = `${card.title} — ${profile.name}`;
  const image =
    card.cover.type === "image"
      ? { url: card.cover.shot.src, width: card.cover.shot.width, height: card.cover.shot.height, alt: card.title }
      : { url: "/og.jpg", width: 2400, height: 1260, alt: card.title };

  return {
    title,
    description: card.summary,
    alternates: { canonical: `/work/${card.slug}` },
    openGraph: {
      title,
      description: card.summary,
      type: "article",
      url: `/work/${card.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: card.summary,
      images: [image.url],
    },
  };
}

const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

/** Bordered so it reads as the way back, not as a caption. */
const BACK_LINK =
  "inline-flex items-center gap-2 border border-hairline-strong bg-surface/60 px-3.5 py-2 font-mono text-label text-fg no-underline transition-colors duration-200 hover:border-accent hover:text-accent motion-reduce:transition-none";


export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const card = getWorkCard(slug);
  if (!card) notFound();

  const index = workCards.indexOf(card);
  const glance = getGlance(slug);
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

          {glance ? <Glance glance={glance} /> : null}

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
          {/* The page has just made the case; give the reader somewhere to go
              with it that is not the back button. */}
          <section
            aria-label="Hire me"
            className="mt-24 flex flex-col gap-5 border border-hairline bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div>
              <p className="text-lg font-semibold text-fg">
                Need something like this built?
              </p>
              <p className="mt-1 text-fg-secondary">
                {processContent.availability}.
              </p>
            </div>
            <a
              href={contactHref}
              className="inline-flex shrink-0 items-center self-start bg-accent px-5 py-3 text-sm font-semibold text-accent-ink no-underline transition-colors duration-200 hover:bg-accent-hover motion-reduce:transition-none sm:self-auto"
            >
              Start a project
            </a>
          </section>

          <nav
            aria-label="More work"
            className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-8"
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

/**
 * The ten-second version, for a reader who is not going to read the rest:
 * what was wrong, what I built, what changed.
 */
function Glance({
  glance,
}: {
  glance: { problem: string; built: string; result: string };
}) {
  const rows = [
    ["The problem", glance.problem],
    ["What I built", glance.built],
    ["The result", glance.result],
  ] as const;

  return (
    <dl className="mt-10 grid gap-px border border-hairline bg-hairline md:grid-cols-3">
      {rows.map(([label, text]) => (
        <div key={label} className="bg-surface/60 p-5 sm:p-6">
          <dt className="font-mono text-micro uppercase text-accent">{label}</dt>
          <dd className="mt-2 text-fg">{text}</dd>
        </div>
      ))}
    </dl>
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
