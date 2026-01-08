/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com"
      },
    ]
  },
  
  experimental: {
    // Optional: Add problematic packages here if needed
    // serverComponentsExternalPackages: ['prisma'],
  },
  
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  staticPageGenerationTimeout: 120,
};

export default nextConfig;