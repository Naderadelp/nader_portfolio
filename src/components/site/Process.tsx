import type { ProcessContent } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";
import { ExternalLink } from "@/components/ui/ExternalLink";

/**
 * How an engagement works: the steps, then the practical terms.
 *
 * Social proof is a link out to LinkedIn, not quotes on the page — AGENTS.md
 * excludes testimonials, and a link to recommendations people wrote under
 * their own names is checkable in a way a quote here is not.
 */
export function Process({ content }: { content: ProcessContent }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <ol className="space-y-8 lg:col-span-7">
        {content.steps.map((step, index) => (
          <li key={step.title}>
            <Reveal delay={index * 40} className="flex gap-5">
              <span className="font-mono text-label text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold text-fg">{step.title}</h3>
                <p className="mt-1.5 max-w-measure text-fg-secondary">
                  {step.body}
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className="lg:col-span-5">
        <div className="border border-hairline bg-surface/50 p-6">
          <h3 className="font-mono text-micro uppercase text-fg-muted">
            The practical part
          </h3>
          <ul className="mt-4 space-y-3 text-fg-secondary">
            {content.terms.map((term) => (
              <li key={term} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 bg-accent" />
                {term}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-hairline pt-5 text-sm">
            <ExternalLink href={content.recommendations.href}>
              {content.recommendations.label}
            </ExternalLink>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
