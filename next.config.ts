import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/static-map",
      },
      {
        pathname: "/media/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
