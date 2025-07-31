"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cloudStorage } from "@/lib/cloudStorage";

export default function TestDownloadPage() {
  const [endpoint, setEndpoint] = useState("http://127.0.0.1:8000/cloud");
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testDownload = async () => {
    setIsLoading(true);
    setResult("測試中...");

    try {
      // 設定雲端配置
      cloudStorage.setConfig({
        endpoint: endpoint,
      });

      // 測試下載
      const downloadResult = await cloudStorage.downloadData();

      if (downloadResult.success) {
        setResult(
          `下載成功！\n作品數量: ${
            downloadResult.data?.works.length || 0
          }\n標籤數量: ${
            downloadResult.data?.tags.length || 0
          }\n\n數據: ${JSON.stringify(downloadResult.data, null, 2)}`
        );
      } else {
        setResult(
          `下載失敗: ${downloadResult.message}\n錯誤: ${downloadResult.error}`
        );
      }
    } catch (error) {
      setResult(
        `測試失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResult("測試連接中...");

    try {
      const result = await cloudStorage.testConnection(endpoint);
      setResult(
        `連接測試結果: ${result.success ? "成功" : "失敗"}\n訊息: ${
          result.message
        }`
      );
    } catch (error) {
      setResult(
        `連接測試失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">雲端下載測試</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="endpoint">雲端端點</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://127.0.0.1:8000/cloud"
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? "測試中..." : "測試連接"}
            </Button>
            <Button onClick={testDownload} disabled={isLoading}>
              {isLoading ? "下載中..." : "測試下載"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
