"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { workStorage } from "@/lib/localStorage";
import EpisodeManager from "@/components/EpisodeManager";
import { Episode } from "@/types";

export default function EpisodeTestPage() {
  const [testWorks, setTestWorks] = useState<any[]>([]);

  const addTestWork = (type: string, episodes: Episode[]) => {
    const work = workStorage.create({
      title: `測試${type} - ${new Date().toLocaleTimeString()}`,
      type: type as any,
      status: "進行中",
      year: 2024,
      rating: 4,
      episodes,
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

  const addSampleEpisodes = () => {
    const episodes: Episode[] = [
      {
        id: "ep-1",
        number: 1,
        title: "第一集",
        description: "這是第一集的描述",
        type: "episode",
        season: 1,
        watched: true,
        date_watched: new Date().toISOString(),
      },
      {
        id: "ep-2",
        number: 2,
        title: "第二集",
        description: "這是第二集的描述",
        type: "episode",
        season: 1,
        watched: false,
      },
      {
        id: "ep-special",
        number: 1,
        title: "特別篇",
        description: "這是特別篇的描述",
        type: "special",
        season: 1,
        watched: false,
      },
    ];

    addTestWork("動畫", episodes);
  };

  const addChapterEpisodes = () => {
    const episodes: Episode[] = [
      {
        id: "ch-1",
        number: 1,
        title: "第一章",
        description: "這是第一章的內容",
        type: "chapter",
        season: 1,
        watched: true,
        date_watched: new Date().toISOString(),
      },
      {
        id: "ch-2",
        number: 2,
        title: "第二章",
        description: "這是第二章的內容",
        type: "chapter",
        season: 1,
        watched: false,
      },
    ];

    addTestWork("小說", episodes);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">集數管理測試</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 測試操作 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>測試操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={addSampleEpisodes}>新增動畫測試</Button>
                <Button onClick={addChapterEpisodes}>新增小說測試</Button>
              </div>
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

          <Card>
            <CardHeader>
              <CardTitle>集數管理組件測試</CardTitle>
            </CardHeader>
            <CardContent>
              <EpisodeManager
                episodes={[
                  {
                    id: "test-1",
                    number: 1,
                    title: "測試集數",
                    description: "這是一個測試集數",
                    type: "episode",
                    season: 1,
                    watched: false,
                  },
                ]}
                onEpisodesChange={(episodes) => {
                  console.log("集數更新:", episodes);
                }}
                type="動畫"
              />
            </CardContent>
          </Card>
        </div>

        {/* 統計資訊 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>測試作品列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testWorks.map((work, index) => {
                  const episodes = work.episodes || [];
                  const watchedCount = episodes.filter(
                    (ep: any) => ep.watched
                  ).length;
                  const totalEpisodes = episodes.length;
                  const completionRate =
                    totalEpisodes > 0
                      ? Math.round((watchedCount / totalEpisodes) * 100)
                      : 0;

                  return (
                    <div key={index} className="border p-3 rounded">
                      <div className="font-medium">{work.title}</div>
                      <div className="text-sm text-gray-600">
                        類型: {work.type} | 集數: {watchedCount}/{totalEpisodes}{" "}
                        ({completionRate}%)
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        集數類型:{" "}
                        {Object.entries(
                          episodes.reduce((acc: any, ep: any) => {
                            acc[ep.type] = (acc[ep.type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .map(([type, count]) => `${type}:${count}`)
                          .join(", ")}
                      </div>
                    </div>
                  );
                })}
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
