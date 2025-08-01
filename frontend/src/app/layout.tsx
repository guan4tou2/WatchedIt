import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstall from "@/components/PWAInstall";
import { ThemeProvider } from "@/components/ThemeProvider";
import { pwaService } from "@/lib/pwa";
import SPARedirect from "@/components/SPARedirect";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

// 移除硬編碼的路徑前綴，讓 Vercel 自動處理
const basePath = "";

export const metadata: Metadata = {
  title: "WatchedIt - 看過了",
  description: "記錄和管理看過的動畫、電影、電視劇、小說等作品",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WatchedIt",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      {
        url: `${basePath}/favicon.ico`,
        sizes: "any",
        type: "image/x-icon",
      },
      {
        url: `${basePath}/icons/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: `${basePath}/icons/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <SPARedirect />
            {children}
          </Suspense>
          <PWAInstall />
        </ThemeProvider>
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA 初始化
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // 使用相對路徑，讓瀏覽器自動處理
                  const swPath = '/sw.js';
                  
                  navigator.serviceWorker.register(swPath)
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // 改善 Service Worker 通訊錯誤處理
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', function(event) {
                  console.log('SW message received:', event.data);
                });
                
                navigator.serviceWorker.addEventListener('error', function(event) {
                  console.error('SW error:', event.error);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
