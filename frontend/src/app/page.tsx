"use client";

import { useEffect } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlatformInfo from "@/components/PlatformInfo";
import { pwaService } from "@/lib/pwa";

export default function HomePage() {
  const { works, stats, loading, error, initialize, fetchWorks, fetchStats } =
    useWorkStore();

  useEffect(() => {
    // 初始化本地儲存
    initialize();

    // 載入數據
    fetchWorks();
    fetchStats();

    // 註冊 PWA 服務
    pwaService.registerServiceWorker();
  }, [initialize, fetchWorks, fetchStats]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          錯誤: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">看過了</h1>
        <Button>新增作品</Button>
      </div>

      {/* 平台資訊 */}
      <PlatformInfo />

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總作品數</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_works}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">動畫</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.type_stats["動畫"] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">進行中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.status_stats["進行中"] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.status_stats["已完成"] || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 作品列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">最近作品</h2>
        {works.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            還沒有作品，開始新增你的第一個作品吧！
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.slice(0, 6).map((work) => (
              <Card key={work.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{work.title}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{work.type}</span>
                    <span>•</span>
                    <span>{work.status}</span>
                    {work.year && (
                      <>
                        <span>•</span>
                        <span>{work.year}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {work.rating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <span className="text-sm text-gray-600">評分:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= work.rating!
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {work.review && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {work.review}
                    </p>
                  )}
                  {work.tags && work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs rounded"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
