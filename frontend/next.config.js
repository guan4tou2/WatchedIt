/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["s4.anilist.co"], // 允許 AniList 圖片
  },
  // PWA 配置
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
  // 實驗性功能
  experimental: {
    // 啟用 Service Worker
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
