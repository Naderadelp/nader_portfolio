import type { MetadataRoute } from "next";

import { workCards } from "@/lib/portfolio";
import { absoluteUrl } from "@/lib/site-url";

/** Generated at build time into `out/sitemap.xml` — no server involved. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    ...workCards.map((card) => ({
      url: absoluteUrl(`/work/${card.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
