import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits `out/` with one HTML file per route.
  // This forbids SSR-only features (route handlers, cookies(), headers(),
  // middleware, server actions, ISR) — see docs/SPEC.md.
  output: "export",

  // next/image's optimiser needs a running server; a static export has none.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
