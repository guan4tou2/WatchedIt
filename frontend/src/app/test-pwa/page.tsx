"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Download, Trash2 } from "lucide-react";

export default function TestPWAPage() {
  const [pwaStatus, setPwaStatus] = useState({
    isPWA: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    hasInstallPrompt: false,
    installPromptShown: false,
    pwaInstalled: false,
  });

  const updatePWAStatus = () => {
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const installPromptShown = localStorage.getItem(
      "watchedit_install_prompt_shown"
    );
    const pwaInstalled = localStorage.getItem("watchedit_pwa_installed");

    setPwaStatus({
      isPWA,
      isMobile,
      isIOS,
      isAndroid,
      hasInstallPrompt: false, // 這個需要通過 beforeinstallprompt 事件來檢測
      installPromptShown: !!installPromptShown,
      pwaInstalled: !!pwaInstalled,
    });
  };

  const resetInstallPrompt = () => {
    localStorage.removeItem("watchedit_install_prompt_shown");
    localStorage.removeItem("watchedit_pwa_installed");
    updatePWAStatus();
  };

  const simulateInstallPrompt = () => {
    // 模擬觸發 beforeinstallprompt 事件
    const event = new Event("beforeinstallprompt");
    window.dispatchEvent(event);
  };

  useEffect(() => {
    updatePWAStatus();

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = () => {
      setPwaStatus((prev) => ({ ...prev, hasInstallPrompt: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">PWA 安裝測試</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PWA 狀態 */}
        <Card>
          <CardHeader>
            <CardTitle>PWA 狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>PWA 模式:</span>
                <Badge variant={pwaStatus.isPWA ? "default" : "secondary"}>
                  {pwaStatus.isPWA ? "已安裝" : "未安裝"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>移動設備:</span>
                <Badge variant={pwaStatus.isMobile ? "default" : "secondary"}>
                  {pwaStatus.isMobile ? "是" : "否"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>iOS:</span>
                <Badge variant={pwaStatus.isIOS ? "default" : "secondary"}>
                  {pwaStatus.isIOS ? "是" : "否"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Android:</span>
                <Badge variant={pwaStatus.isAndroid ? "default" : "secondary"}>
                  {pwaStatus.isAndroid ? "是" : "否"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>安裝提示可用:</span>
                <Badge
                  variant={pwaStatus.hasInstallPrompt ? "default" : "secondary"}
                >
                  {pwaStatus.hasInstallPrompt ? "是" : "否"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安裝提示狀態 */}
        <Card>
          <CardHeader>
            <CardTitle>安裝提示狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>已顯示過提示:</span>
                <Badge
                  variant={
                    pwaStatus.installPromptShown ? "default" : "secondary"
                  }
                >
                  {pwaStatus.installPromptShown ? "是" : "否"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>已安裝 PWA:</span>
                <Badge
                  variant={pwaStatus.pwaInstalled ? "default" : "secondary"}
                >
                  {pwaStatus.pwaInstalled ? "是" : "否"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                onClick={resetInstallPrompt}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                重置安裝提示狀態
              </Button>

              <Button
                onClick={updatePWAStatus}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重新檢查狀態
              </Button>

              <Button
                onClick={simulateInstallPrompt}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                模擬安裝提示
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 說明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>測試說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              • <strong>PWA 模式</strong>: 檢查是否以 PWA 模式運行
            </p>
            <p>
              • <strong>移動設備</strong>: 檢查是否在移動設備上
            </p>
            <p>
              • <strong>安裝提示可用</strong>: 檢查瀏覽器是否支援安裝提示
            </p>
            <p>
              • <strong>已顯示過提示</strong>: 檢查是否已經顯示過安裝提示
            </p>
            <p>
              • <strong>已安裝 PWA</strong>: 檢查是否已經安裝過 PWA
            </p>
            <p>
              • <strong>重置安裝提示狀態</strong>: 清除本地儲存的安裝狀態
            </p>
            <p>
              • <strong>模擬安裝提示</strong>: 觸發 beforeinstallprompt 事件
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 原始數據 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>原始數據</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(pwaStatus, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
