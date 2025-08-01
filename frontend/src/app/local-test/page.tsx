"use client";

import { useEffect, useState } from "react";
import {
  workStorage,
  tagStorage,
  initializeSampleData,
} from "@/lib/localStorage";

// 設定為動態渲染，避免服務器端渲染問題
export const dynamic = "force-dynamic";

export default function LocalTestPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  const loadData = () => {
    if (typeof window === "undefined") return;

    try {
      const worksData = workStorage.getAll();
      const tagsData = tagStorage.getAll();
      const statsData = workStorage.getStats();

      setWorks(worksData);
      setTags(tagsData);
      setStats(statsData);
    } catch (error) {
      console.error("載入數據失敗:", error);
    }
  };

  const addSampleWork = () => {
    if (typeof window === "undefined") return;

    try {
      workStorage.create({
        title: "測試作品 " + new Date().toLocaleTimeString(),
        type: "動畫",
        status: "進行中",
        year: 2024,
        rating: 4,
        source: "手動新增",
      });
      loadData();
      setMessage("已新增測試作品");
    } catch (error) {
      console.error("新增測試作品失敗:", error);
    }
  };

  const addSampleTag = () => {
    if (typeof window === "undefined") return;

    try {
      tagStorage.create({
        name: "測試標籤 " + new Date().toLocaleTimeString(),
        color: "#FF6B6B",
      });
      loadData();
      setMessage("已新增測試標籤");
    } catch (error) {
      console.error("新增測試標籤失敗:", error);
    }
  };

  const clearAllData = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.clear();
      loadData();
      setMessage("已清除所有數據");
    } catch (error) {
      console.error("清除數據失敗:", error);
    }
  };

  const initializeData = () => {
    if (typeof window === "undefined") return;

    try {
      // 檢查是否已經初始化過
      const hasInitialized = localStorage.getItem(
        "watchedit_sample_initialized"
      );

      if (!hasInitialized) {
        initializeSampleData();
        localStorage.setItem("watchedit_sample_initialized", "true");
        setMessage("已初始化示例數據");
      } else {
        setMessage("示例數據已經初始化過，如需重新初始化請先清除數據");
      }

      loadData();
    } catch (error) {
      console.error("初始化數據失敗:", error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    loadData();
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">本地儲存測試</h1>
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">本地儲存測試</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={addSampleWork}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          新增測試作品
        </button>
        <button
          onClick={addSampleTag}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          新增測試標籤
        </button>
        <button
          onClick={initializeData}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          初始化示例數據
        </button>
        <button
          onClick={clearAllData}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          清除所有數據
        </button>
      </div>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 統計數據 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">統計數據</h2>
          {stats && (
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 作品列表 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            作品列表 ({works.length})
          </h2>
          <div className="space-y-2">
            {works.map((work) => (
              <div key={work.id} className="bg-white border p-3 rounded">
                <div className="font-medium">{work.title}</div>
                <div className="text-sm text-gray-600">
                  {work.type} • {work.status} • {work.year}
                </div>
                {work.rating && (
                  <div className="text-sm text-gray-600">
                    評分: {work.rating}/5
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 標籤列表 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            標籤列表 ({tags.length})
          </h2>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div key={tag.id} className="bg-white border p-3 rounded">
                <span className="px-2 py-1 text-sm rounded">{tag.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 原始數據 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">原始數據</h2>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-medium mb-2">localStorage 內容:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  works: localStorage.getItem("watchedit_works"),
                  tags: localStorage.getItem("watchedit_tags"),
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
