/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for GitHub Pages
  ...(process.env.GITHUB_ACTIONS && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  // For Vercel, use default Next.js behavior
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
