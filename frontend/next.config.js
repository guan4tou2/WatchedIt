/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["s4.anilist.co"], // 允許 AniList 圖片
  },
};

module.exports = nextConfig;
