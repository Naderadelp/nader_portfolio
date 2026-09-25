/**
 * The site's absolute origin, read from the environment — never hard-coded.
 *
 * Cloudflare Pages sets `CF_PAGES_URL` on every build, so production and each
 * preview get their own correct origin. `NEXT_PUBLIC_SITE_URL` overrides it,
 * which is how a custom domain drops in later with no code change. The
 * localhost fallback only ever applies to a local build.
 *
 * Used wherever an absolute URL is unavoidable: `metadataBase`, the sitemap,
 * robots.txt and the structured data.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.CF_PAGES_URL ??
    "http://localhost:3000",
);

/** An absolute URL for a site path, e.g. `absoluteUrl("/work/tenders")`. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
