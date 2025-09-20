/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  assetPrefix: '/Kairo_testing',
  basePath: '/Kairo_testing',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
