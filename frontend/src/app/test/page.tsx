"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function TestPage() {
  const [stats, setStats] = useState<any>(null);
  const [works, setWorks] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("測試 API 連接...");

      // 測試統計 API
      const statsData = await apiClient.getStats();
      console.log("統計數據:", statsData);
      setStats(statsData);

      // 測試作品列表 API
      const worksData = await apiClient.getWorks();
      console.log("作品數據:", worksData);
      setWorks(worksData);
    } catch (err) {
      console.error("API 測試失敗:", err);
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API 測試頁面</h1>

      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? "測試中..." : "重新測試 API"}
      </button>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          <strong>錯誤:</strong> {error}
        </div>
      )}

      {stats && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4">
          <strong>統計 API 成功:</strong>
          <pre className="mt-2 text-sm">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {works && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-200 px-4 py-3 rounded mb-4">
          <strong>作品 API 成功:</strong>
          <pre className="mt-2 text-sm">{JSON.stringify(works, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
