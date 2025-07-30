"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Episode } from "@/types";
import { Plus, X, Check } from "lucide-react";

interface QuickAddEpisodeProps {
  workId: string;
  workTitle: string;
  workType: "動畫" | "電影" | "電視劇" | "小說" | "漫畫" | "遊戲";
  onEpisodeAdded: (episode: Episode) => void;
  onClose: () => void;
}

export default function QuickAddEpisode({
  workId,
  workTitle,
  workType,
  onEpisodeAdded,
  onClose,
}: QuickAddEpisodeProps) {
  const [episodeData, setEpisodeData] = useState({
    number: 1,
    title: "",
    description: "",
    type: "episode" as const,
    season: 1,
    note: "",
  });

  const getEpisodeTypeLabel = (type: string) => {
    switch (type) {
      case "episode":
        return "正篇";
      case "special":
        return "特別篇";
      case "ova":
        return "OVA";
      case "movie":
        return "電影";
      case "chapter":
        return "章節";
      default:
        return "正篇";
    }
  };

  const getEpisodeTypeColor = (type: string) => {
    switch (type) {
      case "episode":
        return "bg-blue-100 text-blue-800";
      case "special":
        return "bg-yellow-100 text-yellow-800";
      case "ova":
        return "bg-purple-100 text-purple-800";
      case "movie":
        return "bg-red-100 text-red-800";
      case "chapter":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generateEpisodeId = () => {
    return (
      "episode-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    );
  };

  const handleAddEpisode = () => {
    if (!episodeData.number) return;

    const episode: Episode = {
      id: generateEpisodeId(),
      number: episodeData.number,
      title: episodeData.title || undefined,
      description: episodeData.description || undefined,
      type: episodeData.type,
      season: episodeData.season,
      watched: true,
      date_watched: new Date().toISOString(),
      note: episodeData.note || undefined,
    };

    onEpisodeAdded(episode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">快速新增集數</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">為「{workTitle}」新增集數</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">季數</label>
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
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">集數</label>
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
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">標題</label>
            <Input
              value={episodeData.title}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, title: e.target.value })
              }
              placeholder="可選"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">描述</label>
            <Input
              value={episodeData.description}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, description: e.target.value })
              }
              placeholder="可選"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">類型</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {["episode", "special", "ova", "movie", "chapter"].map((type) => (
                <Badge
                  key={type}
                  className={`cursor-pointer ${
                    episodeData.type === type
                      ? getEpisodeTypeColor(type)
                      : "bg-gray-100 text-gray-600"
                  }`}
                  onClick={() =>
                    setEpisodeData({ ...episodeData, type: type as any })
                  }
                >
                  {getEpisodeTypeLabel(type)}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">備註</label>
            <Input
              value={episodeData.note}
              onChange={(e) =>
                setEpisodeData({ ...episodeData, note: e.target.value })
              }
              placeholder="可選"
              className="mt-1"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleAddEpisode} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              新增集數
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
