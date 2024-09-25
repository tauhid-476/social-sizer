/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental:{
    serverComponentsExternalPackages: ['@vercel/blob'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ]
  },
};

export default nextConfig;
