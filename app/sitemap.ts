import type { MetadataRoute } from "next";
import { gym } from "@/data/gym";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: gym.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${gym.url}${gym.images.hero}`],
    },
  ];
}
