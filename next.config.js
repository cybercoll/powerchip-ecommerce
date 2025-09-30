/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable turbopack to fix NextAuth ERR_ABORTED issues
  // turbopack: {
  //   root: process.cwd(),
  //   resolveAlias: {
  //     '@': './src'
  //   }
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig