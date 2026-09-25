import { Portrait } from "@/components/site/Portrait";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/ui/icons";

export interface HeroStat {
  value: string;
  label: string;
}

interface HeroProps {
  name: string;
  /** Two lines. The second is drawn as outline lettering. */
  headline: [string, string];
  lead: string;
  availability: string;
  stats: readonly HeroStat[];
  portraitSrc: string;
  cvHref: string;
}

/**
 * First screen.
 *
 * The headline is a claim rather than a name — the name is already in the nav,
 * the tab title and the portrait caption, and spending the largest type on
 * this site sees on a name wastes the only moment a scanning reader is
 * guaranteed to give it.
 *
 * The stat row leads with authorship rather than tenure on purpose. A year and
 * a half of experience is a weak opening line against the other engineers a
 * reader is comparing this with; "20,665 lines, sole author" is not, and it is
 * the number that survives being checked.
 */
export function Hero({
  name,
  headline,
  lead,
  availability,
  stats,
  portraitSrc,
  cvHref,
}: HeroProps) {
  return (
    <section
      id="top"
      className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pb-28 lg:pt-40"
    >
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-7">
          {/* Availability. */}
          <p className="inline-flex items-center gap-2 border border-hairline bg-surface/70 px-3 py-1.5 font-mono text-micro uppercase text-fg-secondary">
            <span className="relative grid size-1.5 place-items-center">
              <span className="absolute size-full rounded-full bg-ok" />
              <span
                aria-hidden="true"
                className="absolute size-full animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-ok"
              />
            </span>
            {availability}
          </p>

          <h1 className="mt-7 text-display font-semibold">
            <span className="block text-fg">{headline[0]}</span>
            {/* Outline lettering. The stroke colour is a text-grade token, not
                a hairline — see the note in globals.css. */}
            <span className="text-outline block">{headline[1]}</span>
          </h1>

          <p className="mt-7 max-w-measure text-lead text-fg-secondary">
            {lead}
          </p>

          {/* Calls to action. */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-accent-ink no-underline transition-colors duration-200 hover:bg-accent-hover motion-reduce:transition-none"
            >
              See the work
              <ArrowUpRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </a>
            <a
              href={cvHref}
              download
              className="inline-flex items-center gap-2 border border-hairline-strong px-5 py-3 text-sm font-medium text-fg no-underline transition-colors duration-200 hover:border-accent hover:text-accent motion-reduce:transition-none"
            >
              <DownloadIcon className="size-4" />
              Download CV
            </a>
          </div>

          {/* Countable claims. */}
          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-micro uppercase text-fg-muted">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-mono text-xl font-medium text-fg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-5">
          <Portrait
            src={portraitSrc}
            alt={`${name}, backend software engineer`}
            name={name}
            status="Open to work"
            className="mx-auto w-full max-w-sm lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
