/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid outputFileTracingRoot on Vercel to prevent path0/path0 ENOENT for .next/routes-manifest.json.
  // If you need to trace from repo root (e.g. monorepo), set Root Directory in Vercel to the app folder.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  turbopack: {
    // Empty config to acknowledge Turbopack usage and silence warnings
  },
}

export default nextConfig
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
  turbopack: {
    // Empty config to acknowledge Turbopack usage and silence warnings
  },
}

export default nextConfig
