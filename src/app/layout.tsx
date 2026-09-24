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
  // No metadataBase / canonical host: a custom domain must drop in later with
  // no rework (docs/SPEC.md).
  openGraph: {
    title: "Nader Adel — Backend Engineer",
    description:
      "Backend engineer in Cairo building Laravel and TypeScript systems.",
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

/**
 * Runs before first paint so the theme class is on <html> when the first
 * styles apply — no flash. Every storage access is wrapped because blocked
 * storage must not take the page down.
 */
const THEME_SCRIPT = `(function(){try{var s=null;try{s=localStorage.getItem("theme")}catch(e){}var d=(s==="dark"||s==="light")?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var c=document.documentElement.classList;c.add(d?"dark":"light");c.remove(d?"light":"dark")}catch(e){document.documentElement.classList.add("dark")}})();`;

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
