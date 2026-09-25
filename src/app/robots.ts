import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

/** Generated at build time into `out/robots.txt` — no server involved. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
