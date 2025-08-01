"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkStore } from "@/store/useWorkStore";
import { workStorage, tagStorage } from "@/lib/indexedDB";

// 設定為動態渲染，避免服務器端渲染問題
export const dynamic = "force-dynamic";

export default function TestSampleDataPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const { resetSampleDataFlag } = useWorkStore();

  const loadData = async () => {
    if (typeof window === "undefined") return;

    try {
      const worksData = await workStorage.getAll();
      const tagsData = await tagStorage.getAll();
      const initialized = localStorage.getItem("watchedit_sample_initialized");

      setWorks(worksData);
      setTags(tagsData);
      setHasInitialized(!!initialized);
    } catch (error) {
      console.error("載入數據失敗:", error);
    }
  };

  const clearAllData = async () => {
    if (typeof window === "undefined") return;

    try {
      await workStorage.clearAll();
      await tagStorage.clearAll();
      await loadData();
      setMessage("已清除所有數據");
    } catch (error) {
      console.error("清除數據失敗:", error);
    }
  };

  const resetInitializationFlag = () => {
    if (typeof window === "undefined") return;

    try {
      resetSampleDataFlag();
      setHasInitialized(false);
      setMessage("已重置初始化標記");
    } catch (error) {
      console.error("重置標記失敗:", error);
    }
  };

  const reinitialize = async () => {
    if (typeof window === "undefined") return;

    try {
      // 清除所有數據
      await workStorage.clearAll();
      await tagStorage.clearAll();

      // 重置標記
      resetSampleDataFlag();

      // 重新載入
      await loadData();
      setMessage("已重新初始化示例數據");
    } catch (error) {
      console.error("重新初始化失敗:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">示例數據測試</h1>

      <Card>
        <CardHeader>
          <CardTitle>📊 當前狀態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>作品數量:</strong> {works.length}
          </p>
          <p>
            <strong>標籤數量:</strong> {tags.length}
          </p>
          <p>
            <strong>已初始化標記:</strong> {hasInitialized ? "✅ 是" : "❌ 否"}
          </p>
          {message && <p className="text-blue-600">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛠️ 操作工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={loadData} className="w-full">
            重新載入數據
          </Button>
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="w-full"
          >
            清除所有數據
          </Button>
          <Button
            onClick={resetInitializationFlag}
            variant="outline"
            className="w-full"
          >
            重置初始化標記
          </Button>
          <Button onClick={reinitialize} variant="secondary" className="w-full">
            重新初始化示例數據
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📝 作品列表</CardTitle>
        </CardHeader>
        <CardContent>
          {works.length === 0 ? (
            <p className="text-gray-500">沒有作品</p>
          ) : (
            <div className="space-y-2">
              {works.map((work) => (
                <div key={work.id} className="p-2 border rounded">
                  <p>
                    <strong>{work.title}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    {work.type} • {work.status} • {work.year}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏷️ 標籤列表</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-gray-500">沒有標籤</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="p-2 border rounded">
                  <p>
                    <strong>{tag.name}</strong>
                  </p>
                  <p className="text-sm text-gray-600">顏色: {tag.color}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 測試說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>問題:</strong> 刪除預設作品後重整網頁還是會出現
          </p>
          <p>
            <strong>原因:</strong> 系統檢查到沒有作品時會自動重新初始化示例數據
          </p>
          <p>
            <strong>解決方案:</strong> 添加初始化標記，防止重複初始化
          </p>
          <p>
            <strong>測試步驟:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>點擊「清除所有數據」</li>
            <li>重新整理頁面</li>
            <li>檢查是否還會出現預設作品</li>
            <li>如果沒有出現，說明修復成功</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
