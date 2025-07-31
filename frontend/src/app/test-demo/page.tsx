"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  workStorage,
  tagStorage,
  initializeSampleData,
  dbUtils,
} from "@/lib/indexedDB";
import { Work, Tag } from "@/types";
import { Eye, Star, Calendar, Tag as TagIcon } from "lucide-react";

export default function TestDemoPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [worksData, tagsData] = await Promise.all([
        workStorage.getAll(),
        tagStorage.getAll(),
      ]);

      setWorks(worksData);
      setTags(tagsData);
    } catch (error) {
      console.error("載入數據失敗:", error);
      setMessage("載入數據失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      // 清空現有數據
      await dbUtils.clearAll();

      // 重新初始化示例數據
      await initializeSampleData();

      // 重新載入數據
      await loadData();

      setMessage("Demo 數據已重置");
    } catch (error) {
      console.error("重置 Demo 數據失敗:", error);
      setMessage("重置失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeStats = () => {
    const stats: Record<string, number> = {};
    works.forEach((work) => {
      stats[work.type] = (stats[work.type] || 0) + 1;
    });
    return stats;
  };

  const getStatusStats = () => {
    const stats: Record<string, number> = {};
    works.forEach((work) => {
      stats[work.status] = (stats[work.status] || 0) + 1;
    });
    return stats;
  };

  const typeStats = getTypeStats();
  const statusStats = getStatusStats();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Demo 作品測試</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 統計信息 */}
        <Card>
          <CardHeader>
            <CardTitle>作品統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">類型分布</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeStats).map(([type, count]) => (
                    <Badge key={type} variant="secondary">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">狀態分布</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusStats).map(([status, count]) => (
                    <Badge key={status} variant="outline">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 標籤信息 */}
        <Card>
          <CardHeader>
            <CardTitle>標籤信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按鈕 */}
      <div className="mb-6">
        <Button onClick={resetDemoData} disabled={isLoading} className="mr-4">
          {isLoading ? "處理中..." : "重置 Demo 數據"}
        </Button>
        <Button onClick={loadData} disabled={isLoading} variant="outline">
          {isLoading ? "載入中..." : "重新載入"}
        </Button>
      </div>

      {/* 作品列表 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Demo 作品列表</h2>

        {works.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {isLoading ? "載入中..." : "沒有作品"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((work) => {
              const episodes = work.episodes || [];
              const watchedCount = episodes.filter((ep) => ep.watched).length;
              const totalEpisodes = episodes.length;

              return (
                <Card
                  key={work.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {work.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Badge variant="outline">{work.type}</Badge>
                          <Badge variant="outline">{work.status}</Badge>
                          {work.year && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {work.year}
                            </span>
                          )}
                        </div>
                      </div>
                      {work.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{work.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 集數進度 */}
                    {totalEpisodes > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>進度</span>
                          <span>
                            {watchedCount}/{totalEpisodes}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(watchedCount / totalEpisodes) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* 評論 */}
                    {work.review && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {work.review}
                      </p>
                    )}

                    {/* 標籤 */}
                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {work.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {work.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{work.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 來源 */}
                    {work.source && (
                      <div className="mt-2 text-xs text-gray-500">
                        來源: {work.source}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
