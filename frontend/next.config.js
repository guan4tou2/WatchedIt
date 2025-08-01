/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生產環境配置
  basePath:
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_BASE_PATH
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : "",
  assetPrefix:
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_BASE_PATH
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : "",

  images: {
    domains: ["s4.anilist.co"], // 允許 AniList 圖片
    unoptimized: process.env.NODE_ENV === "production" ? false : true, // 生產環境啟用圖片優化
  },

  // 實驗性功能
  experimental: {
    // 啟用 Service Worker
    workerThreads: false,
    cpus: 1,
    // 生產環境優化 - 暫時禁用 optimizeCss 以避免 critters 依賴問題
    // optimizeCss: process.env.NODE_ENV === "production",
    optimizePackageImports:
      process.env.NODE_ENV === "production" ? ["lucide-react"] : [],
  },

  // 解決 hydration 問題
  reactStrictMode: process.env.NODE_ENV === "production",

  // 輸出配置
  output: process.env.NODE_ENV === "production" ? "standalone" : "export",

  // 確保靜態資源正確處理
  trailingSlash: true,

  // 處理路由
  skipTrailingSlashRedirect: true,

  // 生產環境優化
  compress: process.env.NODE_ENV === "production",
  poweredByHeader: false,
  generateEtags: false,

  // 安全標頭
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL + "/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
