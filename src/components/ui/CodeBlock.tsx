import { cn } from "./cn";
import { ExternalLink } from "./ExternalLink";
import type { CodeExcerpt } from "@/components/layout/types";

interface CodeBlockProps extends CodeExcerpt {
  className?: string;
}

/**
 * Filename header + excerpt + a link to the real file on GitHub.
 *
 * `html` is pre-highlighted markup produced at build time (there is no runtime
 * highlighter — this is a static export). When it is absent the plain `code`
 * string is rendered with mono styling.
 */
export function CodeBlock({
  filename,
  language,
  code,
  html,
  githubUrl,
  note,
  className,
}: CodeBlockProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-hairline bg-surface",
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-hairline px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-label text-fg-secondary">
          <span className="truncate">{filename}</span>
          {language ? (
            <span className="text-fg-muted uppercase tracking-[0.08em]">
              {language}
            </span>
          ) : null}
        </span>
        {githubUrl ? (
          <ExternalLink href={githubUrl} className="font-mono text-label no-underline">
            View on GitHub
          </ExternalLink>
        ) : null}
      </figcaption>

      {/* Long lines scroll sideways, so the scroll container has to be
          reachable from the keyboard — otherwise the end of a line cannot be
          read without a pointer (WCAG 2.1.1, axe `scrollable-region-focusable`).
          A focusable region needs an accessible name, hence role + label. */}
      <div
        data-allows-x-scroll=""
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={`${filename} — code excerpt, scrolls horizontally`}
      >
        <pre className="px-4 py-4 font-mono text-[0.8125rem] leading-[1.7] text-fg-secondary">
          {html ? (
            <code
              // Pre-highlighted at build time from content we author ourselves.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>

      {note ? (
        <p className="border-t border-hairline px-4 py-2.5 text-sm text-fg-muted">
          {note}
        </p>
      ) : null}
    </figure>
  );
}
