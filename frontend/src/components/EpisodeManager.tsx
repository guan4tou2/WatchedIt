"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Episode } from "@/types";
import { Plus, Edit, Trash2, Check } from "lucide-react";

interface EpisodeManagerProps {
  episodes: Episode[];
  onEpisodesChange: (episodes: Episode[]) => void;
  type: "動畫" | "電影" | "電視劇" | "小說" | "漫畫" | "遊戲";
  disabled?: boolean;
}

export default function EpisodeManager({
  episodes,
  onEpisodesChange,
  type,
  disabled = false,
}: EpisodeManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [newEpisode, setNewEpisode] = useState({
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
    if (!newEpisode.number) return;

    // 檢查是否已存在相同季數和集數的集數
    const existingEpisode = episodes.find(
      (ep) => ep.season === newEpisode.season && ep.number === newEpisode.number
    );

    if (existingEpisode) {
      alert(`第${newEpisode.season}季第${newEpisode.number}集已存在！`);
      return;
    }

    const episode: Episode = {
      id: generateEpisodeId(),
      number: newEpisode.number,
      title: newEpisode.title || undefined,
      description: newEpisode.description || undefined,
      type: newEpisode.type,
      season: newEpisode.season,
      watched: false,
      note: newEpisode.note || undefined,
    };

    const updatedEpisodes = [...episodes, episode].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.number - b.number;
    });

    onEpisodesChange(updatedEpisodes);
    setNewEpisode({
      number: 1,
      title: "",
      description: "",
      type: "episode",
      season: 1,
      note: "",
    });
    setIsAdding(false);
  };

  const handleUpdateEpisode = (episode: Episode) => {
    const updatedEpisodes = episodes.map((ep) =>
      ep.id === episode.id ? episode : ep
    );
    onEpisodesChange(updatedEpisodes);
    setEditingEpisode(null);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    const updatedEpisodes = episodes.filter((ep) => ep.id !== episodeId);
    onEpisodesChange(updatedEpisodes);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">集數管理</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              已記錄: {episodes.length} 集
            </span>
            {!disabled && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-1" />
                新增集數
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新增集數表單 */}
        {isAdding && (
          <Card className="border-2 border-dashed border-blue-200">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">集數</label>
                  <Input
                    type="number"
                    min="1"
                    value={newEpisode.number}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        number: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">季數</label>
                  <Input
                    type="number"
                    min="1"
                    value={newEpisode.season}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        season: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">類型</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newEpisode.type}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="episode">正篇</option>
                    <option value="special">特別篇</option>
                    <option value="ova">OVA</option>
                    <option value="movie">電影</option>
                    <option value="chapter">章節</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">標題 (選填)</label>
                  <Input
                    value={newEpisode.title}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        title: e.target.value,
                      })
                    }
                    placeholder="集數標題"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">描述 (選填)</label>
                  <Input
                    value={newEpisode.description}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        description: e.target.value,
                      })
                    }
                    placeholder="集數描述"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">備註 (選填)</label>
                  <Input
                    value={newEpisode.note}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        note: e.target.value,
                      })
                    }
                    placeholder="個人備註"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleAddEpisode}>
                  <Check className="w-4 h-4 mr-1" />
                  新增
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 集數列表 */}
        <div className="space-y-2">
          {episodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              還沒有集數，點擊「新增集數」開始添加
            </div>
          ) : (
            episodes.map((episode) => (
              <Card
                key={episode.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="text-center">
                          <div className="font-semibold">
                            第{episode.season}季 第{episode.number}集
                          </div>
                          {episode.title && (
                            <div className="text-sm text-gray-600">
                              {episode.title}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={getEpisodeTypeColor(episode.type)}>
                        {getEpisodeTypeLabel(episode.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!disabled && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingEpisode(episode)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEpisode(episode.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {(episode.description || episode.note) && (
                    <div className="mt-2 text-sm text-gray-600">
                      {episode.description && (
                        <div className="mb-1">{episode.description}</div>
                      )}
                      {episode.note && (
                        <div className="text-xs text-gray-500">
                          備註: {episode.note}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 編輯集數對話框 */}
        {editingEpisode && (
          <Card className="border-2 border-dashed border-blue-200">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">集數</label>
                  <Input
                    type="number"
                    min="1"
                    value={editingEpisode.number}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        number: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">季數</label>
                  <Input
                    type="number"
                    min="1"
                    value={editingEpisode.season}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        season: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">類型</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={editingEpisode.type}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="episode">正篇</option>
                    <option value="special">特別篇</option>
                    <option value="ova">OVA</option>
                    <option value="movie">電影</option>
                    <option value="chapter">章節</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">標題</label>
                  <Input
                    value={editingEpisode.title || ""}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        title: e.target.value || undefined,
                      })
                    }
                    placeholder="集數標題"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">描述</label>
                  <Input
                    value={editingEpisode.description || ""}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        description: e.target.value || undefined,
                      })
                    }
                    placeholder="集數描述"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">備註</label>
                  <Input
                    value={editingEpisode.note || ""}
                    onChange={(e) =>
                      setEditingEpisode({
                        ...editingEpisode,
                        note: e.target.value || undefined,
                      })
                    }
                    placeholder="個人備註"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => handleUpdateEpisode(editingEpisode)}
                >
                  <Check className="w-4 h-4 mr-1" />
                  更新
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingEpisode(null)}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
