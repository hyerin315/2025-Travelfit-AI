/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/api/images/**',
      },
    ],
  },
}

module.exports = nextConfig

