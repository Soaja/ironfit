import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [80],
    // 1440/1600 fill the gap between 1200 and 1920: the hero is wider than the
    // viewport on portrait phones (it covers a 4:3 stage), so these get used.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 2560],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
