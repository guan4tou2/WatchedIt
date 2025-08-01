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

// 根據環境決定基礎路徑
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/WatchedIt" : "";

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
  icons: {
    icon: [
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
                  // 根據環境決定 Service Worker 路徑
                  const swPath = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? '/sw.js' 
                    : '/WatchedIt/sw.js';
                  
                  navigator.serviceWorker.register(swPath)
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
