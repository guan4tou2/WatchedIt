"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Clock } from "lucide-react";

export default function TestSortingPage() {
  const { works, createWork } = useWorkStore();
  const [sortedWorks, setSortedWorks] = useState<any[]>([]);

  useEffect(() => {
    // 模擬主頁面的排序邏輯
    const filteredAndSorted = works
      .filter((work) => true) // 不過濾，顯示所有作品
      .sort((a, b) => {
        // 按新增時間排序，最新的在前面
        const dateA = new Date(a.date_added || 0);
        const dateB = new Date(b.date_added || 0);
        return dateB.getTime() - dateA.getTime();
      });

    setSortedWorks(filteredAndSorted);
  }, [works]);

  const addTestWork = async () => {
    const testWork = {
      title: `測試作品 ${new Date().toLocaleTimeString()}`,
      type: "動畫" as const,
      status: "進行中" as const,
      year: 2024,
      rating: 4,
      review: "測試評論",
      note: "測試備註",
      source: "手動測試",
      tags: [],
      episodes: [],
    };

    try {
      await createWork(testWork);
    } catch (error) {
      console.error("新增測試作品失敗:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-TW");
  };

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
        <h1 className="text-2xl font-bold">作品排序測試</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 測試操作 */}
        <Card>
          <CardHeader>
            <CardTitle>測試操作</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={addTestWork} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              新增測試作品
            </Button>
            <div className="mt-4 text-sm text-gray-600">
              <p>• 點擊按鈕新增一個測試作品</p>
              <p>• 觀察作品是否按時間排序</p>
              <p>• 最新的作品應該顯示在最前面</p>
            </div>
          </CardContent>
        </Card>

        {/* 排序資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>排序資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>總作品數:</strong> {works.length}
              </p>
              <p>
                <strong>排序後作品數:</strong> {sortedWorks.length}
              </p>
              <p>
                <strong>排序方式:</strong> 按新增時間（最新在前）
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 原始作品列表 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>原始作品列表（未排序）</CardTitle>
        </CardHeader>
        <CardContent>
          {works.length === 0 ? (
            <p className="text-gray-500">沒有作品</p>
          ) : (
            <div className="space-y-2">
              {works.map((work, index) => (
                <div
                  key={work.id}
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{work.title}</h3>
                    <p className="text-sm text-gray-600">
                      {work.type} • {work.status} • 索引: {index}
                    </p>
                    {work.date_added && (
                      <p className="text-xs text-gray-500">
                        新增時間: {formatDate(work.date_added)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{work.type}</Badge>
                    <Badge variant="outline">{work.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 排序後作品列表 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>排序後作品列表（最新在前）</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedWorks.length === 0 ? (
            <p className="text-gray-500">沒有作品</p>
          ) : (
            <div className="space-y-2">
              {sortedWorks.map((work, index) => (
                <div
                  key={work.id}
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium">{work.title}</h3>
                    <p className="text-sm text-gray-600">
                      {work.type} • {work.status} • 排序位置: {index + 1}
                    </p>
                    {work.date_added && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(work.date_added)}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{work.type}</Badge>
                    <Badge variant="outline">{work.status}</Badge>
                    {index === 0 && (
                      <Badge variant="default" className="bg-green-500">
                        最新
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 排序邏輯說明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>排序邏輯說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              • <strong>排序方式</strong>: 按 `date_added` 時間戳排序
            </p>
            <p>
              • <strong>排序順序</strong>: 最新的作品顯示在最前面
            </p>
            <p>
              • <strong>排序邏輯</strong>: `dateB.getTime() - dateA.getTime()`
            </p>
            <p>
              • <strong>應用範圍</strong>: 主頁面的最近作品顯示
            </p>
            <p>
              • <strong>影響範圍</strong>: 新增作品後會立即顯示在最前面
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
