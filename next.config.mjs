/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        // 临时兼容 HTTP，建议全部使用 HTTPS
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

