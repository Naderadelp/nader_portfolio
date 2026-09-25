"use client";

import { useActiveSection } from "@/components/layout/useActiveSection";
import type { NavItem, SectionId, SocialLink } from "@/components/layout/types";
import { cn } from "@/components/ui/cn";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: MailIcon,
} as const;

interface SiteNavProps {
  monogram: string;
  name: string;
  items: readonly NavItem[];
  /** Every section the spy observes, in document order. */
  sectionIds: readonly SectionId[];
  socials: readonly SocialLink[];
  /**
   * Prefix for the section links. Empty on the home page; "/" on a project
   * page, so "Work" goes back to "/#work" rather than to an anchor that is
   * not there.
   */
  hrefBase?: string;
}

/**
 * Fixed top bar: monogram, a centred pill of section links, socials and the
 * theme toggle.
 *
 * The pill is hidden below `md`. On a phone there is no room for five labels
 * beside the monogram and the icons, and a hamburger that opens a sheet is a
 * lot of machinery for a single-page document the reader can simply scroll.
 * The skip link in layout.tsx and the in-page headings carry that weight
 * instead.
 *
 * The bar is translucent with a backdrop blur, so the grid and the glow behind
 * it stay visible while the text on top stays legible.
 */
export function SiteNav({
  monogram,
  name,
  items,
  sectionIds,
  socials,
  hrefBase = "",
}: SiteNavProps) {
  const active = useActiveSection(sectionIds);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="border-b border-hairline/60 bg-bg/70 backdrop-blur-xl">
        <nav
          aria-label="Site"
          className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
        >
          {/* Monogram — also the "back to top" affordance. */}
          <a
            href={`${hrefBase}#top`}
            className="group flex shrink-0 items-center gap-2.5 no-underline"
          >
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center border border-hairline-strong bg-surface font-mono text-label font-medium text-accent transition-colors duration-200 group-hover:border-accent motion-reduce:transition-none"
            >
              {monogram}
            </span>
            <span className="hidden text-sm font-medium text-fg sm:block">
              {name}
            </span>
          </a>

          {/* Section links. */}
          <ul className="hidden items-center gap-1 border border-hairline bg-surface/80 px-1.5 py-1.5 md:flex">
            {items.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`${hrefBase}#${item.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "block px-3 py-1 font-mono text-micro uppercase no-underline transition-colors duration-200 motion-reduce:transition-none",
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-fg-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Socials and theme. */}
          <div className="flex shrink-0 items-center gap-1">
            {socials.map((social) => {
              const Icon = ICONS[social.icon];
              return (
                <a
                  key={social.href}
                  href={social.href}
                  aria-label={social.label}
                  {...(social.icon === "email"
                    ? {}
                    : { target: "_blank", rel: "noreferrer noopener" })}
                  className="grid size-9 place-items-center text-fg-muted transition-colors duration-200 hover:text-accent motion-reduce:transition-none"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
