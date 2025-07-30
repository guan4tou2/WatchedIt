"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { workStorage } from "@/lib/localStorage";
import EpisodeProgressComponent from "@/components/EpisodeProgress";
import { EpisodeProgress } from "@/types";

export default function EpisodeTestPage() {
  const [currentProgress, setCurrentProgress] = useState<EpisodeProgress>({
    current: 5,
    total: 12,
    special: 1,
    season: 1,
    episode_type: "episode",
  });

  const [testWorks, setTestWorks] = useState<any[]>([]);

  const addTestWork = (type: string, progress: EpisodeProgress) => {
    const work = workStorage.create({
      title: `測試${type} - ${new Date().toLocaleTimeString()}`,
      type: type as any,
      status: "進行中",
      year: 2024,
      rating: 4,
      progress,
      source: "測試新增",
    });

    setTestWorks([...testWorks, work]);
  };

  const clearTestWorks = () => {
    // 清除測試作品
    const works = workStorage.getAll();
    const filteredWorks = works.filter((w) => !w.title.includes("測試"));
    localStorage.setItem("watchedit_works", JSON.stringify(filteredWorks));
    setTestWorks([]);
  };

  const handleProgressChange = (progress: EpisodeProgress) => {
    setCurrentProgress(progress);
    console.log("進度更新:", progress);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">集數管理測試</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 進度組件測試 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>進度組件測試</CardTitle>
            </CardHeader>
            <CardContent>
              <EpisodeProgressComponent
                progress={currentProgress}
                onProgressChange={handleProgressChange}
                type="動畫"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>不同類型測試</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() =>
                    addTestWork("動畫", {
                      current: 8,
                      total: 24,
                      special: 2,
                      season: 1,
                      episode_type: "episode",
                    })
                  }
                >
                  新增動畫
                </Button>
                <Button
                  onClick={() =>
                    addTestWork("小說", {
                      current: 15,
                      total: 20,
                      special: 0,
                      season: 1,
                      episode_type: "chapter",
                    })
                  }
                >
                  新增小說
                </Button>
                <Button
                  onClick={() =>
                    addTestWork("漫畫", {
                      current: 50,
                      total: undefined,
                      special: 0,
                      season: 1,
                      episode_type: "chapter",
                    })
                  }
                >
                  新增漫畫
                </Button>
                <Button
                  onClick={() =>
                    addTestWork("電影", {
                      current: 1,
                      total: 1,
                      special: 0,
                      season: 1,
                      episode_type: "movie",
                    })
                  }
                >
                  新增電影
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  onClick={clearTestWorks}
                  variant="outline"
                  className="w-full"
                >
                  清除測試作品
                </Button>
                <Button
                  onClick={() => {
                    const works = workStorage.getAll();
                    console.log("所有作品:", works);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  查看所有作品
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 統計資訊 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>當前進度</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(currentProgress, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>測試作品列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testWorks.map((work, index) => (
                  <div key={index} className="border p-3 rounded">
                    <div className="font-medium">{work.title}</div>
                    <div className="text-sm text-gray-600">
                      類型: {work.type} | 進度: {work.progress?.current || 0}
                      {work.progress?.total && `/${work.progress.total}`}
                    </div>
                  </div>
                ))}
                {testWorks.length === 0 && (
                  <div className="text-gray-500 text-center py-4">
                    還沒有測試作品
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>統計數據</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(workStorage.getStats(), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
