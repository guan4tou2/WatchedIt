const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生產環境配置 - 移除 basePath 設定，避免在 Vercel 部署時添加路徑前綴
  // basePath:
  //   process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_BASE_PATH
  //     ? process.env.NEXT_PUBLIC_BASE_PATH
  //     : "",
  // assetPrefix:
  //   process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_BASE_PATH
  //     ? process.env.NEXT_PUBLIC_BASE_PATH
  //     : "",

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

  // 輸出配置 - 使用標準輸出模式，與 Vercel 兼容
  // output: "standalone", // 註解掉以避免 Vercel 部署問題

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

  // API 代理配置
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // 如果設定了環境變數，使用代理
    if (apiUrl && apiUrl !== "http://localhost:8000") {
      return [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/:path*`,
        },
      ];
    }

    // 否則返回空陣列，讓 Next.js 處理本地 API
    return [];
  },
};

module.exports = withNextIntl(nextConfig);
