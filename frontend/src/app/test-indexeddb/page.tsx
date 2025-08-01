"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workStorage, tagStorage, dbUtils } from "@/lib/indexedDB";
import { WorkCreate } from "@/types";

export default function TestIndexedDBPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [worksData, tagsData, info] = await Promise.all([
        workStorage.getAll(),
        tagStorage.getAll(),
        dbUtils.getDatabaseInfo(),
      ]);

      setWorks(worksData);
      setTags(tagsData);
      setDbInfo(info);
    } catch (error) {
      console.error("載入數據失敗:", error);
      setMessage("載入數據失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const testAddWork = async () => {
    setIsLoading(true);
    try {
      const newWork: WorkCreate = {
        title: `測試作品 ${Date.now()}`,
        type: "動畫",
        status: "進行中",
        year: 2024,
        rating: 4,
        source: "測試",
        episodes: [
          {
            id: `ep-${Date.now()}`,
            number: 1,
            title: "測試集數",
            description: "這是一個測試集數",
            type: "episode",
            season: 1,
            watched: true,
            date_watched: new Date().toISOString(),
          },
        ],
      };

      await workStorage.create(newWork);
      await loadData();
      setMessage("新增作品成功");
    } catch (error) {
      console.error("新增作品失敗:", error);
      setMessage("新增作品失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const testAddTag = async () => {
    setIsLoading(true);
    try {
      await tagStorage.create({
        name: `測試標籤 ${Date.now()}`,
        color: "#FF6B6B",
      });
      await loadData();
      setMessage("新增標籤成功");
    } catch (error) {
      console.error("新增標籤失敗:", error);
      setMessage("新增標籤失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const testClearAll = async () => {
    if (confirm("確定要清空所有數據嗎？")) {
      setIsLoading(true);
      try {
        await dbUtils.clearAll();
        await loadData();
        setMessage("清空數據成功");
      } catch (error) {
        console.error("清空數據失敗:", error);
        setMessage("清空數據失敗");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const testExportData = async () => {
    setIsLoading(true);
    try {
      const data = await dbUtils.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `indexeddb_test_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage("匯出數據成功");
    } catch (error) {
      console.error("匯出數據失敗:", error);
      setMessage("匯出數據失敗");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">IndexedDB 測試</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 資料庫信息 */}
        <Card>
          <CardHeader>
            <CardTitle>資料庫信息</CardTitle>
          </CardHeader>
          <CardContent>
            {dbInfo ? (
              <div className="space-y-2">
                <p>作品數量: {dbInfo.worksCount}</p>
                <p>標籤數量: {dbInfo.tagsCount}</p>
              </div>
            ) : (
              <p>載入中...</p>
            )}
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <Card>
          <CardHeader>
            <CardTitle>操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={testAddWork} disabled={isLoading}>
                {isLoading ? "處理中..." : "新增作品"}
              </Button>
              <Button onClick={testAddTag} disabled={isLoading}>
                {isLoading ? "處理中..." : "新增標籤"}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button onClick={loadData} disabled={isLoading}>
                {isLoading ? "載入中..." : "重新載入"}
              </Button>
              <Button onClick={testExportData} disabled={isLoading}>
                {isLoading ? "處理中..." : "匯出數據"}
              </Button>
            </div>
            <Button
              onClick={testClearAll}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "處理中..." : "清空所有數據"}
            </Button>
          </CardContent>
        </Card>

        {/* 作品列表 */}
        <Card>
          <CardHeader>
            <CardTitle>作品列表 ({works.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {works.map((work) => (
                <div key={work.id} className="p-2 border rounded">
                  <p className="font-medium">{work.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {work.type} • {work.status} • {work.year}
                  </p>
                </div>
              ))}
              {works.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">沒有作品</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 標籤列表 */}
        <Card>
          <CardHeader>
            <CardTitle>標籤列表 ({tags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="p-2 border rounded">
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    顏色: {tag.color}
                  </p>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">沒有標籤</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
