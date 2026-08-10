/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Lets `NEXT_DIST_DIR=.next-prod next build` run without clobbering the
  // .next a concurrent `next dev` is serving. Unset everywhere else, so
  // Vercel and local dev both use the default.
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

module.exports = nextConfig;
