import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstall from "@/components/PWAInstall";
import { pwaService } from "@/lib/pwa";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WatchedIt - 看過了",
  description: "記錄和管理看過的動畫、電影、電視劇、小說等作品",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="application-name" content="WatchedIt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WatchedIt" />
        <meta
          name="description"
          content="記錄和管理看過的動畫、電影、電視劇、小說等作品"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-192x192.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://watchedit.app" />
        <meta name="twitter:title" content="WatchedIt" />
        <meta
          name="twitter:description"
          content="記錄和管理看過的動畫、電影、電視劇、小說等作品"
        />
        <meta
          name="twitter:image"
          content="https://watchedit.app/icons/icon-192x192.png"
        />
        <meta name="twitter:creator" content="@watchedit" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WatchedIt" />
        <meta
          property="og:description"
          content="記錄和管理看過的動畫、電影、電視劇、小說等作品"
        />
        <meta property="og:site_name" content="WatchedIt" />
        <meta property="og:url" content="https://watchedit.app" />
        <meta
          property="og:image"
          content="https://watchedit.app/icons/icon-192x192.png"
        />
      </head>
      <body className={inter.className}>
        {children}
        <PWAInstall />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA 初始化
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
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
