/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 配置
  basePath: process.env.NODE_ENV === "production" ? "/WatchedIt" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/WatchedIt/" : "",
  trailingSlash: true,

  images: {
    domains: ["s4.anilist.co"], // 允許 AniList 圖片
    unoptimized: true, // GitHub Pages 需要
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

  // 解決 hydration 問題
  reactStrictMode: false,

  // 輸出配置 - 改回 standalone 以支援動態路由
  output: "standalone",
};

module.exports = nextConfig;
