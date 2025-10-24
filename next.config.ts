/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'efrazwhhlzxmcqygzosr.supabase.co', // Your Supabase domain
      },
      {
        protocol: 'https',
        hostname: 'cdn-images.dzcdn.net', // The Deezer image domain
      }
    ]
  }
};

module.exports = nextConfig;