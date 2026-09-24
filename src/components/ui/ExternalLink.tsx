import { cn } from "./cn";
import { ArrowUpRightIcon } from "./icons";

interface ExternalLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
  /** Hide the trailing arrow (for icon-only or in-flow prose links). */
  showArrow?: boolean;
}

/**
 * Outbound link in the accent colour with a small arrow that nudges on hover.
 * Static export means no client JS is needed here.
 */
export function ExternalLink({
  href,
  children,
  className,
  showArrow = true,
  ...rest
}: ExternalLinkProps) {
  const isExternal = /^https?:/i.test(href);

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
      className={cn(
        "group/link inline-flex items-baseline gap-1 text-accent",
        "underline decoration-accent/35 underline-offset-[3px]",
        "transition-colors duration-150 hover:text-accent-hover hover:decoration-accent-hover/60",
        className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {showArrow ? (
        <ArrowUpRightIcon
          className={cn(
            "size-[0.85em] shrink-0 translate-y-[0.06em]",
            "transition-transform duration-150 ease-out",
            "group-hover/link:translate-x-0.5 group-hover/link:-translate-y-[0.06em]",
            "motion-reduce:transition-none motion-reduce:group-hover/link:translate-x-0",
          )}
        />
      ) : null}
    </a>
  );
}
