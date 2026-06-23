"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl, getApiUrl, config } from "@/lib/config";

export default function TestConfigPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");
  const [windowOrigin, setWindowOrigin] = useState<string>("");
  const [connectionResult, setConnectionResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl());
    setApiUrl(getApiUrl("/search/anime"));
    setWindowOrigin(
      typeof window !== "undefined" ? window.location.origin : "N/A"
    );
  }, []);

  const testApiConnection = async () => {
    setConnectionResult(null);
    try {
      const response = await fetch("/api/search/anime?query=test");
      await response.json();
      setConnectionResult({
        type: "success",
        text: `API 連接成功！回應狀態: ${response.status}`,
      });
    } catch (error) {
      setConnectionResult({
        type: "error",
        text: `API 連接失敗: ${error}`,
      });
      console.error("API 錯誤:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">配置測試頁面</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">環境變數</h2>
          <div className="space-y-2">
            <p>
              <strong>NEXT_PUBLIC_API_URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_API_URL || "未設定"}
            </p>
            <p>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV || "未設定"}
            </p>
            <p>
              <strong>NEXT_PUBLIC_APP_NAME:</strong>{" "}
              {process.env.NEXT_PUBLIC_APP_NAME || "未設定"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">動態配置</h2>
          <div className="space-y-2">
            <p>
              <strong>API 基礎 URL:</strong> {apiBaseUrl}
            </p>
            <p>
              <strong>完整 API URL:</strong> {apiUrl}
            </p>
            <p>
              <strong>瀏覽器 Origin:</strong> {windowOrigin}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">配置物件</h2>
          <div className="space-y-2">
            <p>
              <strong>應用程式名稱:</strong> {config.app.name}
            </p>
            <p>
              <strong>版本:</strong> {config.app.version}
            </p>
            <p>
              <strong>是否為開發環境:</strong>{" "}
              {config.isDevelopment ? "是" : "否"}
            </p>
            <p>
              <strong>是否為生產環境:</strong>{" "}
              {config.isProduction ? "是" : "否"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">測試 API 連接</h2>
          {connectionResult && (
            <div
              role={connectionResult.type === "success" ? "status" : "alert"}
              aria-label="API 連接結果"
              className={`mb-4 rounded border px-4 py-3 text-sm ${
                connectionResult.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {connectionResult.text}
            </div>
          )}
          <button
            onClick={testApiConnection}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            測試 API 連接
          </button>
        </div>
      </div>
    </div>
  );
}
