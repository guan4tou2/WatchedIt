"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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
      setDeferredPrompt(e);

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
      console.log("PWA was installed");
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
      console.log("User accepted the install prompt");
      // 標記已安裝
      localStorage.setItem("watchedit_pwa_installed", "true");
    } else {
      console.log("User dismissed the install prompt");
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
    <div className="fixed bottom-4 left-4 right-4 bg-white dropdown-bg border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium title-text">安裝 WatchedIt</h3>
            <p className="text-sm description-text">
              將應用程式安裝到主畫面，享受更好的使用體驗
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
