import type { MetadataRoute } from "next";
import { gym, legal } from "@/data/gym";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: gym.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${gym.url}${gym.images.hero}`],
    },
    // Legal pages only once their real text is in (they are noindex until then).
    ...(legal.pagesReady
      ? (["privacy", "cookie"] as const).map((p) => ({
          url: `${gym.url}/${p}`,
          lastModified: new Date(),
          changeFrequency: "yearly" as const,
          priority: 0.2,
        }))
      : []),
  ];
}
