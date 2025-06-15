/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 15 호환성을 위한 설정
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
