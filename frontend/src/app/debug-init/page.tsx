"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkStore } from "@/store/useWorkStore";
import { workStorage, tagStorage } from "@/lib/indexedDB";

// 設定為動態渲染，避免服務器端渲染問題
export const dynamic = "force-dynamic";

export default function DebugInitPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const { resetSampleDataFlag } = useWorkStore();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkInitializationStatus = async () => {
    try {
      addLog("開始檢查初始化狀態...");

      // 檢查 localStorage 標記
      const hasInitialized = localStorage.getItem(
        "watchedit_sample_initialized"
      );
      addLog(`localStorage 標記: ${hasInitialized ? "已初始化" : "未初始化"}`);

      // 檢查 IndexedDB 數據
      const works = await workStorage.getAll();
      const tags = await tagStorage.getAll();
      addLog(`IndexedDB 作品數量: ${works.length}`);
      addLog(`IndexedDB 標籤數量: ${tags.length}`);

      // 檢查作品詳情
      const workTitles = works.map((w) => w.title);
      addLog(`作品標題: ${workTitles.join(", ")}`);

      setDebugInfo({
        hasInitialized: !!hasInitialized,
        worksCount: works.length,
        tagsCount: tags.length,
        workTitles,
        works,
        tags,
      });
    } catch (error) {
      addLog(`檢查失敗: ${error}`);
    }
  };

  const clearAllData = async () => {
    try {
      addLog("開始清除所有數據...");

      await workStorage.clearAll();
      await tagStorage.clearAll();

      addLog("數據已清除");
      await checkInitializationStatus();
    } catch (error) {
      addLog(`清除失敗: ${error}`);
    }
  };

  const resetFlag = () => {
    try {
      addLog("重置初始化標記...");
      resetSampleDataFlag();
      addLog("標記已重置");
      checkInitializationStatus();
    } catch (error) {
      addLog(`重置失敗: ${error}`);
    }
  };

  const simulatePageReload = async () => {
    try {
      addLog("模擬頁面重新載入...");

      // 清除當前狀態
      setDebugInfo({});
      setLogs([]);

      // 重新初始化
      const { initialize } = useWorkStore.getState();
      await initialize();

      addLog("重新初始化完成");
      await checkInitializationStatus();
    } catch (error) {
      addLog(`模擬失敗: ${error}`);
    }
  };

  const forceInitialize = async () => {
    try {
      addLog("強制初始化示例數據...");

      // 清除標記
      resetSampleDataFlag();

      // 清除數據
      await workStorage.clearAll();
      await tagStorage.clearAll();

      // 重新初始化
      const { initialize } = useWorkStore.getState();
      await initialize();

      addLog("強制初始化完成");
      await checkInitializationStatus();
    } catch (error) {
      addLog(`強制初始化失敗: ${error}`);
    }
  };

  useEffect(() => {
    checkInitializationStatus();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">🔍 初始化調試工具</h1>

      <Card>
        <CardHeader>
          <CardTitle>📊 當前狀態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>已初始化標記:</strong>{" "}
            {debugInfo.hasInitialized ? "✅ 是" : "❌ 否"}
          </p>
          <p>
            <strong>作品數量:</strong> {debugInfo.worksCount || 0}
          </p>
          <p>
            <strong>標籤數量:</strong> {debugInfo.tagsCount || 0}
          </p>
          <p>
            <strong>作品標題:</strong>{" "}
            {debugInfo.workTitles?.join(", ") || "無"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛠️ 操作工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={checkInitializationStatus} className="w-full">
            重新檢查狀態
          </Button>
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="w-full"
          >
            清除所有數據
          </Button>
          <Button onClick={resetFlag} variant="outline" className="w-full">
            重置初始化標記
          </Button>
          <Button
            onClick={simulatePageReload}
            variant="secondary"
            className="w-full"
          >
            模擬頁面重新載入
          </Button>
          <Button
            onClick={forceInitialize}
            variant="default"
            className="w-full"
          >
            強制初始化示例數據
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 調試日誌</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 測試步驟</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>問題重現步驟:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>點擊「清除所有數據」</li>
            <li>點擊「模擬頁面重新載入」</li>
            <li>檢查是否還會出現預設作品</li>
            <li>如果出現，說明修復無效</li>
          </ol>

          <p className="mt-4">
            <strong>預期結果:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>清除數據後，作品數量應該為 0</li>
            <li>重新載入後，如果標記存在，不應該重新初始化</li>
            <li>只有重置標記後重新載入才會初始化示例數據</li>
          </ul>
        </CardContent>
      </Card>

      {debugInfo.works && debugInfo.works.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 作品詳情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.works.map((work: any) => (
                <div key={work.id} className="p-2 border rounded">
                  <p>
                    <strong>{work.title}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {work.id} | 類型: {work.type} | 來源: {work.source}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
