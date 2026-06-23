"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // 檢查是否已經顯示過安裝提示或已安裝
    const hasShownInstallPrompt = localStorage.getItem(
      "watchedit_install_prompt_shown"
    );
    const hasInstalledPWA = localStorage.getItem("watchedit_pwa_installed");

    // 如果已經安裝過，直接返回
    if (hasInstalledPWA) {
      return;
    }

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 只有在首次使用時才顯示安裝提示
      if (!hasShownInstallPrompt) {
        setShowInstallPrompt(true);
      }
    };

    // 監聽 appinstalled 事件
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      // 標記已安裝
      localStorage.setItem("watchedit_pwa_installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      // 標記已安裝
      localStorage.setItem("watchedit_pwa_installed", "true");
    }

    // 標記已顯示過安裝提示
    localStorage.setItem("watchedit_install_prompt_shown", "true");
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    // 標記已顯示過安裝提示
    localStorage.setItem("watchedit_install_prompt_shown", "true");
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="mx-4 mb-4 mt-4 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dropdown-bg dark:border-gray-700 sm:fixed sm:bottom-4 sm:left-1/2 sm:z-50 sm:mx-0 sm:mt-0 sm:w-[min(640px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium title-text">安裝 WatchedIt</h3>
            <p className="text-sm description-text">
              將應用程式安裝到主畫面，享受更好的使用體驗
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            安裝
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="note-text hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="關閉安裝提示"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
