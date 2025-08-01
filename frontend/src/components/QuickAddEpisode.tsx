"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Episode, EpisodeType, CustomEpisodeType } from "@/types";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";
import { customEpisodeTypeStorage } from "@/lib/customEpisodeTypes";
import { Plus, X, Check } from "lucide-react";

interface QuickAddEpisodeProps {
  workId: string;
  workTitle: string;
  workType: string;
  currentEpisodes: Episode[];
  onEpisodeAdded: (episode: Episode) => void;
  onBatchEpisodesAdded?: (episodes: Episode[]) => void; // 新增批量更新回調
  onClose: () => void;
}

export default function QuickAddEpisode({
  workId,
  workTitle,
  workType,
  currentEpisodes,
  onEpisodeAdded,
  onBatchEpisodesAdded,
  onClose,
}: QuickAddEpisodeProps) {
  // 計算下一集數
  const getNextEpisodeNumber = (season: number = 1) => {
    if (currentEpisodes.length === 0) return 1;

    // 篩選出指定季的所有集數
    const seasonEpisodes = currentEpisodes.filter((ep) => ep.season === season);

    if (seasonEpisodes.length === 0) return 1;

    // 找出該季的最大集數
    const maxNumber = Math.max(...seasonEpisodes.map((ep) => ep.number));
    return maxNumber + 1;
  };

  const [availableEpisodeTypes, setAvailableEpisodeTypes] = useState<
    EpisodeType[]
  >(["episode"]);
  const [defaultEpisodeType, setDefaultEpisodeType] =
    useState<EpisodeType>("episode");
  const [episodeTypeLabels, setEpisodeTypeLabels] = useState<
    Record<string, string>
  >({});
  const [episodeData, setEpisodeData] = useState({
    number: getNextEpisodeNumber(1),
    title: "",
    description: "",
    type: "episode" as EpisodeType,
    season: currentEpisodes.length > 0 ? currentEpisodes[0]?.season || 1 : 1,
    note: "",
  });
  const [batchCount, setBatchCount] = useState(1);

  // 根據作品類型載入對應的集數類型
  useEffect(() => {
    try {
      const episodeTypes =
        workTypeEpisodeMappingStorage.getEpisodeTypesForWorkType(workType);
      const defaultType =
        workTypeEpisodeMappingStorage.getDefaultEpisodeTypeForWorkType(
          workType
        );

      setAvailableEpisodeTypes(episodeTypes);
      setDefaultEpisodeType(defaultType);

      // 更新集數資料的預設類型
      setEpisodeData((prev) => ({
        ...prev,
        type: defaultType,
      }));

      // 載入集數類型標籤
      const labels = customEpisodeTypeStorage.getTypeLabels();
      setEpisodeTypeLabels(labels);
    } catch (error) {
      console.error("載入集數類型失敗:", error);
      setAvailableEpisodeTypes(["episode"]);
      setDefaultEpisodeType("episode");
    }
  }, [workType]);

  const getEpisodeTypeLabel = (type: string) => {
    return episodeTypeLabels[type] || type;
  };

  const getEpisodeTypeColor = (type: string) => {
    const episodeType = customEpisodeTypeStorage.getByName(type);
    if (episodeType) {
      return `bg-[${episodeType.color}]/10 text-[${episodeType.color}]`;
    }

    // 預設顏色
    switch (type) {
      case "episode":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "special":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "ova":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "movie":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      case "chapter":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
    }
  };

  const generateEpisodeId = () => {
    return (
      "episode-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    );
  };

  const handleAddEpisode = () => {
    if (!episodeData.number) return;

    const episodes: Episode[] = [];

    for (let i = 0; i < batchCount; i++) {
      const episode: Episode = {
        id: generateEpisodeId(),
        number: episodeData.number + i,
        title: episodeData.title
          ? `${episodeData.title} ${i > 0 ? `(${i + 1})` : ""}`
          : undefined,
        description: episodeData.description || undefined,
        type: episodeData.type,
        season: episodeData.season,
        watched: true,
        date_watched: new Date().toISOString(),
        note: episodeData.note || undefined,
      };
      episodes.push(episode);
    }

    // 批量新增所有集數 - 一次性更新
    if (onBatchEpisodesAdded && episodes.length > 1) {
      // 如果有批量更新回調且多於一集，使用批量更新
      onBatchEpisodesAdded(episodes);
    } else {
      // 否則逐個更新
      episodes.forEach((episode) => {
        onEpisodeAdded(episode);
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg title-text">快速新增集數</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm description-text">為「{workTitle}」新增集數</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">開始集數</label>
              <Input
                type="number"
                min="1"
                value={episodeData.number}
                onChange={(e) =>
                  setEpisodeData({
                    ...episodeData,
                    number: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1 form-input"
              />
            </div>
            <div>
              <label className="form-label">季數</label>
              <Input
                type="number"
                min="1"
                value={episodeData.season}
                onChange={(e) =>
                  setEpisodeData({
                    ...episodeData,
                    season: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1 form-input"
              />
            </div>
            <div>
              <label className="form-label">新增數量</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={batchCount}
                onChange={(e) =>
                  setBatchCount(
                    Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                  )
                }
                className="mt-1 form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">標題</label>
            <Input
              value={episodeData.title}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, title: e.target.value })
              }
              placeholder="可選"
              className="mt-1 form-input"
            />
          </div>

          <div>
            <label className="form-label">描述</label>
            <Input
              value={episodeData.description}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, description: e.target.value })
              }
              placeholder="可選"
              className="mt-1 form-input"
            />
          </div>

          <div>
            <label className="form-label">類型</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availableEpisodeTypes.map((type) => (
                <Badge
                  key={type}
                  className={`cursor-pointer ${
                    episodeData.type === type
                      ? getEpisodeTypeColor(type)
                      : "badge-unselected"
                  }`}
                  onClick={() =>
                    setEpisodeData({
                      ...episodeData,
                      type: type as EpisodeType,
                    })
                  }
                >
                  {getEpisodeTypeLabel(type)}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">備註</label>
            <Input
              value={episodeData.note}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, note: e.target.value })
              }
              placeholder="可選"
              className="mt-1 form-input"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleAddEpisode} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              新增 {batchCount} 集
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
