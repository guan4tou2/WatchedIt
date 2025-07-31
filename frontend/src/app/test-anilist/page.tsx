"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AniListSearch from "@/components/AniListSearch";
import { WorkCreate } from "@/types";
import { Search } from "lucide-react";

export default function TestAniListPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkCreate | null>(null);

  const handleSelectAnime = (workData: WorkCreate) => {
    setSelectedWork(workData);
    console.log("選中的作品:", workData);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            AniList 搜尋測試
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setIsSearchOpen(true)}>
              <Search className="w-4 h-4 mr-2" />
              搜尋動畫
            </Button>
          </div>

          {selectedWork && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">已選擇作品</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>標題:</strong> {selectedWork.title}
                </p>
                <p>
                  <strong>類型:</strong> {selectedWork.type}
                </p>
                <p>
                  <strong>狀態:</strong> {selectedWork.status}
                </p>
                <p>
                  <strong>年份:</strong> {selectedWork.year}
                </p>
                <p>
                  <strong>評分:</strong> {selectedWork.rating}
                </p>
                <p>
                  <strong>來源:</strong> {selectedWork.source}
                </p>
                {selectedWork.episodes && (
                  <p>
                    <strong>集數:</strong> {selectedWork.episodes.length} 集
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">功能說明</h3>
            <ul className="text-sm space-y-1 text-blue-700">
              <li>• 點擊「搜尋動畫」按鈕開啟搜尋視窗</li>
              <li>• 在搜尋結果中點擊卡片查看動畫詳細資訊</li>
              <li>• 點擊「選擇」按鈕直接選擇作品</li>
              <li>• 在詳情彈窗中可以查看完整的動畫資訊</li>
              <li>• 包含封面圖片、評分、播出時間、類型等詳細資訊</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <AniListSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAnime={handleSelectAnime}
      />
    </div>
  );
}
