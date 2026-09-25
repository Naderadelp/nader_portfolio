"use client";

import { cn } from "@/components/ui/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/ui/icons";
import { useActiveSection } from "./useActiveSection";
import type { NavItem, Profile, SectionId } from "./types";

/** Document order. */
const SPY_SECTIONS: readonly SectionId[] = [
  "about",
  "experience",
  "work",
  "stack",
  "contact",
];

const NAV_ITEMS: readonly NavItem[] = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const SOCIAL_ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: MailIcon,
} as const;

/**
 * Sticky left column at >=1024px, plain page header below that.
 * Carries the single <h1>.
 */
export function Sidebar({ profile }: { profile: Profile }) {
  const active = useActiveSection(SPY_SECTIONS);

  return (
    <header
      className={cn(
        "w-full pt-16 pb-10 lg:w-[42%] lg:max-w-[26rem] lg:shrink-0",
        // Sticky for the whole scroll. `overflow-y-auto` only bites on very
        // short viewports, where the CV button would otherwise be unreachable.
        "lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between",
        "lg:overflow-y-auto lg:py-20",
      )}
    >
      <div>
        <h1 className="text-hero font-semibold text-fg">{profile.name}</h1>

        <p className="mt-3 text-lg font-medium text-fg-secondary">
          {profile.role}
        </p>

        <p className="mt-4 max-w-sm text-fg-secondary">{profile.positioning}</p>

        <p className="mt-3 font-mono text-label uppercase tracking-[0.08em] text-fg-muted">
          {profile.location}
          <span aria-hidden className="mx-2">
            ·
          </span>
          {profile.timezoneNote}
        </p>

        <nav aria-label="Section navigation" className="mt-14 hidden lg:block">
          <ul>
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-active={isActive ? "true" : "false"}
                    aria-current={isActive ? "location" : undefined}
                    className="group flex items-center py-3"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mr-4 h-px w-8 bg-fg-muted",
                        "transition-all duration-200 ease-out motion-reduce:transition-none",
                        "group-hover:w-16 group-hover:bg-fg",
                        "group-data-[active=true]:w-16 group-data-[active=true]:bg-accent",
                      )}
                    />
                    <span
                      className={cn(
                        "font-mono text-label uppercase tracking-[0.12em] text-fg-muted",
                        "transition-colors duration-200 motion-reduce:transition-none",
                        "group-hover:text-fg",
                        "group-data-[active=true]:text-accent",
                      )}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 lg:mt-0">
        <a
          href={profile.cvHref}
          download={profile.cvFileName}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-hairline bg-surface",
            "px-3.5 py-2 font-mono text-label uppercase tracking-[0.08em] text-fg-secondary",
            "transition-colors duration-150 hover:border-accent/50 hover:text-accent",
          )}
        >
          <DownloadIcon className="size-4" />
          Download CV
        </a>

        {/* The icon row and the toggle wrap as one unit, so a narrow viewport
            never strands the toggle on a line of its own. */}
        <div className="flex items-center gap-1">
          <ul className="flex items-center gap-1" aria-label="Elsewhere">
            {profile.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      social.href.startsWith("http")
                        ? "noreferrer noopener"
                        : undefined
                    }
                    aria-label={social.label}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-md",
                      "text-fg-secondary transition-colors duration-150 hover:text-accent",
                    )}
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>

          <ThemeToggle className="ml-1" />
        </div>
      </div>
    </header>
  );
}
