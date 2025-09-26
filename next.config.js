/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SSG export conditionally (commented out to enable dynamic rendering)
  // output: process.env.BUILD_MODE === 'export' ? 'export' : undefined,
  trailingSlash: true,
  
  images: {
    // Enable optimized images for better performance
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Exclude API routes from static export
  ...(process.env.BUILD_MODE === 'export' && {
    experimental: {
      outputFileTracingRoot: process.cwd(),
    },
  }),
}

module.exports = nextConfig
