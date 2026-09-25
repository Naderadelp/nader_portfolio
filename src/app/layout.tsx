import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nader Adel — Backend Engineer",
  description:
    "Backend engineer in Cairo building Laravel and TypeScript systems: publishing pipelines, ERP sync and queue-driven workflows.",
  /**
   * `metadataBase` is read from the environment, never hardcoded.
   *
   * Next absolutises `og:image`, and with no base it falls back to
   * `http://localhost:3000` — which is what this built, silently, until the
   * tag was inspected. A card pointing at localhost is broken for every
   * recipient, and nothing about the page looks wrong locally.
   *
   * Cloudflare Pages sets `CF_PAGES_URL` on every build, so production and
   * previews each get their own correct base with no configuration. Setting
   * `NEXT_PUBLIC_SITE_URL` overrides it, which is how a custom domain drops in
   * later with no code change — the requirement docs/SPEC.md actually cared
   * about. The localhost default only ever applies to `npm run dev`.
   */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.CF_PAGES_URL ??
      "http://localhost:3000",
  ),
  openGraph: {
    title: "Nader Adel — Backend Engineer",
    description:
      "Integrations, queues and reconciliation. Most of what I build runs after the response has already gone out.",
    type: "profile",
    images: [
      {
        url: "/og.jpg",
        width: 2400,
        height: 1260,
        alt: "Nader Adel, Backend Engineer — Laravel and TypeScript. The request ends. The work doesn't.",
      },
    ],
  },
  /**
   * The card is the point of this site.
   *
   * Its main job is to be a link pasted into an email, a LinkedIn message or a
   * WhatsApp thread — and a link with no card renders as a grey rectangle,
   * which is worse than no link at all. `summary_large_image` is what makes
   * the 1.91:1 image render full-width rather than as a thumbnail.
   */
  twitter: {
    card: "summary_large_image",
    title: "Nader Adel — Backend Engineer",
    description:
      "Integrations, queues and reconciliation. Most of what I build runs after the response has already gone out.",
    images: ["/og.jpg"],
  },
};

/**
 * A single colour, because the site now has a single default. Offering a
 * light themeColor behind a `prefers-color-scheme` media query would paint the
 * browser chrome pale for a reader who is about to be shown the dark page.
 */
export const viewport: Viewport = {
  themeColor: "#08080a",
};

/**
 * Runs before first paint so the theme class is on <html> when the first
 * styles apply — no flash. Every storage access is wrapped because blocked
 * storage must not take the page down.
 *
 * Dark is the default and system preference is NOT consulted. This previously
 * mirrored `prefers-color-scheme`, which meant a visitor on a light-mode
 * laptop — most of them — was served the alternate presentation of a site
 * whose entire visual argument is amber on near-black. Light is still fully
 * supported and still tested; it is now something a reader opts into with the
 * toggle, and the stored value records that choice rather than their OS's.
 */
const THEME_SCRIPT = `(function(){try{var s=null;try{s=localStorage.getItem("theme")}catch(e){}var d=s!=="light";var c=document.documentElement.classList;c.add(d?"dark":"light");c.remove(d?"light":"dark")}catch(e){document.documentElement.classList.add("dark")}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The inline script below writes a class here before React hydrates.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Without JS the reveal animation can never run, so show everything. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        <a
          href="#content"
          className="sr-only rounded-md border border-hairline bg-surface px-4 py-2 font-mono text-label text-fg focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
