/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'efrazwhhlzxmcqygzosr.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net',
      }
    ]
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;