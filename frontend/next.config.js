/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages 配置
  basePath: process.env.NODE_ENV === "production" ? "/WatchedIt" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/WatchedIt/" : "",

  images: {
    domains: ["s4.anilist.co"], // 允許 AniList 圖片
    unoptimized: true, // GitHub Pages 需要
  },

  // 實驗性功能
  experimental: {
    // 啟用 Service Worker
    workerThreads: false,
    cpus: 1,
  },

  // 解決 hydration 問題
  reactStrictMode: false,

  // 輸出配置 - 使用 export 以支援 GitHub Pages
  output: "export",

  // 確保靜態資源正確處理
  trailingSlash: true,

  // 處理 GitHub Pages 的路由
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
