import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/joc/hub',
        destination: '/joc',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
