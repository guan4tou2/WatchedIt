"use client";

import { useState } from "react";
import { Episode } from "@/types";
import EpisodeManager from "@/components/EpisodeManager";

export default function EpisodeTestPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([
    {
      id: "ep-1",
      number: 1,
      season: 1,
      title: "第一集",
      description: "這是第一集的描述",
      type: "episode",
      watched: false,
      note: "測試備註",
    },
    {
      id: "ep-2",
      number: 2,
      season: 1,
      title: "第二集",
      description: "這是第二集的描述",
      type: "episode",
      watched: true,
      date_watched: new Date().toISOString(),
      note: "已看完",
    },
    {
      id: "ep-3",
      number: 3,
      season: 1,
      title: "第三集",
      description: "這是第三集的描述",
      type: "episode",
      watched: false,
    },
    {
      id: "ep-4",
      number: 1,
      season: 2,
      title: "第二季第一集",
      description: "第二季開始",
      type: "episode",
      watched: false,
    },
    {
      id: "ep-5",
      number: 2,
      season: 2,
      title: "第二季第二集",
      description: "第二季第二集",
      type: "episode",
      watched: false,
    },
  ]);

  const handleEpisodesChange = (newEpisodes: Episode[]) => {
    console.log("集數變更:", newEpisodes);
    setEpisodes(newEpisodes);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">集數管理測試</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        測試集數管理的批量功能，包括：
      </p>
      <ul className="mb-6 list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
        <li>批量選擇集數</li>
        <li>批量標記已看/未看</li>
        <li>批量刪除集數</li>
        <li>修復手機版點擊已看未看按鈕時跳到最頂端的問題</li>
      </ul>

      <EpisodeManager
        episodes={episodes}
        onEpisodesChange={handleEpisodesChange}
        type="動畫"
        disabled={false}
        isEditing={false}
        onToggleEditing={() => {}}
      />
    </div>
  );
}
