"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Episode, EpisodeType, CustomEpisodeType } from "@/types";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";
import { customEpisodeTypeStorage } from "@/lib/customEpisodeTypes";
import { Plus, Edit, Trash2, Check } from "lucide-react";

interface EpisodeManagerProps {
  episodes: Episode[];
  onEpisodesChange: (episodes: Episode[]) => void;
  type: string;
  disabled?: boolean;
  isEditing?: boolean;
  onToggleEditing?: () => void;
}

export default function EpisodeManager({
  episodes,
  onEpisodesChange,
  type,
  disabled = false,
  isEditing = false,
  onToggleEditing,
}: EpisodeManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [availableEpisodeTypes, setAvailableEpisodeTypes] = useState<
    EpisodeType[]
  >(["episode"]);
  const [defaultEpisodeType, setDefaultEpisodeType] =
    useState<EpisodeType>("episode");
  const [episodeTypeLabels, setEpisodeTypeLabels] = useState<
    Record<string, string>
  >({});
  // 計算下一集數
  const getNextEpisodeNumber = (season: number = 1) => {
    if (episodes.length === 0) return 1;

    // 篩選出指定季的所有集數
    const seasonEpisodes = episodes.filter((ep) => ep.season === season);

    if (seasonEpisodes.length === 0) return 1;

    // 找出該季的最大集數
    const maxNumber = Math.max(...seasonEpisodes.map((ep) => ep.number));
    return maxNumber + 1;
  };

  // 獲取預設季數
  const getDefaultSeason = () => {
    if (episodes.length === 0) return 1;

    // 找出最常用的季數
    const seasonCounts = episodes.reduce((acc, ep) => {
      acc[ep.season] = (acc[ep.season] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostCommonSeason = Object.entries(seasonCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    return mostCommonSeason ? parseInt(mostCommonSeason) : 1;
  };

  const [newEpisode, setNewEpisode] = useState({
    number: getNextEpisodeNumber(1),
    title: "",
    description: "",
    type: "episode" as EpisodeType,
    season: getDefaultSeason(),
    note: "",
  });

  // 根據作品類型載入對應的集數類型
  useEffect(() => {
    try {
      const episodeTypes =
        workTypeEpisodeMappingStorage.getEpisodeTypesForWorkType(type);
      const defaultType =
        workTypeEpisodeMappingStorage.getDefaultEpisodeTypeForWorkType(type);

      setAvailableEpisodeTypes(episodeTypes);
      setDefaultEpisodeType(defaultType);

      // 更新新集數的預設類型
      setNewEpisode((prev) => ({
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
  }, [type]);

  // 當集數列表變化時，更新新增表單的預設集數
  useEffect(() => {
    setNewEpisode((prev) => ({
      ...prev,
      number: getNextEpisodeNumber(prev.season),
    }));
  }, [episodes]);

  // 當季數變化時，重新計算該季的下一集數
  useEffect(() => {
    setNewEpisode((prev) => ({
      ...prev,
      number: getNextEpisodeNumber(prev.season),
    }));
  }, [newEpisode.season]);

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
    return `ep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddEpisode = () => {
    if (newEpisode.number < 1) return;

    try {
      const episode: Episode = {
        id: generateEpisodeId(),
        ...newEpisode,
        watched: false,
      };

      console.log("新增集數:", episode);

      const updatedEpisodes = [...episodes, episode];
      console.log("更新後的集數列表:", updatedEpisodes);

      onEpisodesChange(updatedEpisodes);

      // 重置表單，自動計算下一集數
      setNewEpisode({
        number: getNextEpisodeNumber(newEpisode.season),
        title: "",
        description: "",
        type: defaultEpisodeType,
        season: newEpisode.season,
        note: "",
      });

      setIsAdding(false);
    } catch (error) {
      console.error("新增集數失敗:", error);
    }
  };

  const handleUpdateEpisode = (episode: Episode) => {
    try {
      console.log("更新集數:", episode);

      const updatedEpisodes = episodes.map((ep) =>
        ep.id === episode.id ? episode : ep
      );
      console.log("更新後的集數列表:", updatedEpisodes);

      onEpisodesChange(updatedEpisodes);
      setEditingEpisode(null);
    } catch (error) {
      console.error("更新集數失敗:", error);
    }
  };

  const handleDeleteEpisode = (episodeId: string) => {
    try {
      console.log("刪除集數:", episodeId);

      const updatedEpisodes = episodes.filter((ep) => ep.id !== episodeId);
      console.log("更新後的集數列表:", updatedEpisodes);

      onEpisodesChange(updatedEpisodes);
    } catch (error) {
      console.error("刪除集數失敗:", error);
    }
  };

  const handleToggleWatched = (episodeId: string) => {
    const updatedEpisodes = episodes.map((ep) =>
      ep.id === episodeId
        ? {
            ...ep,
            watched: !ep.watched,
            date_watched: !ep.watched ? new Date().toISOString() : undefined,
          }
        : ep
    );
    onEpisodesChange(updatedEpisodes);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>集數管理</CardTitle>
          <div className="flex space-x-2">
            {onToggleEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleEditing}
                disabled={disabled}
              >
                {isEditing ? "完成編輯" : "編輯集數"}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              disabled={disabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              新增集數
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新增集數表單 */}
        {isAdding && (
          <Card className="border-2 border-dashed border-blue-200">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-text">集數</label>
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
                  <label className="label-text">季數</label>
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
                  <label className="label-text">類型</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:text-foreground/95 dark:bg-background/95"
                    value={newEpisode.type}
                    onChange={(e) =>
                      setNewEpisode({
                        ...newEpisode,
                        type: e.target.value as EpisodeType,
                      })
                    }
                  >
                    {availableEpisodeTypes.map((episodeType) => (
                      <option key={episodeType} value={episodeType}>
                        {getEpisodeTypeLabel(episodeType)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">標題 (選填)</label>
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="label-text">描述 (選填)</label>
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
                <div className="col-span-1 sm:col-span-2">
                  <label className="label-text">備註 (選填)</label>
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
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
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
            <div className="text-center py-8 empty-state">
              還沒有集數，點擊「新增集數」開始添加
            </div>
          ) : (
            episodes.map((episode) => (
              <div key={episode.id}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <div className="text-center sm:text-left">
                            <div className="font-semibold text-sm sm:text-base title-text">
                              第{episode.season}季 第{episode.number}集
                            </div>
                            {episode.title && (
                              <div className="text-xs sm:text-sm description-text">
                                {episode.title}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getEpisodeTypeColor(episode.type)}>
                          {getEpisodeTypeLabel(episode.type)}
                        </Badge>
                        <Button
                          size="sm"
                          variant={episode.watched ? "default" : "outline"}
                          onClick={() => handleToggleWatched(episode.id)}
                          className={
                            episode.watched
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }
                        >
                          {episode.watched ? "✅ 已看" : "⬜ 未看"}
                        </Button>
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
                              className="text-red-600 dark:text-red-400 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {(episode.description || episode.note) && (
                      <div className="mt-2 text-sm description-text">
                        {episode.description && (
                          <div className="mb-1">{episode.description}</div>
                        )}
                        {episode.note && (
                          <div className="text-xs note-text">
                            備註: {episode.note}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 編輯集數表單 - 顯示在當前編輯的集數下方 */}
                {editingEpisode && editingEpisode.id === episode.id && (
                  <Card className="mt-2 border-2 border-dashed border-blue-200">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="form-label-secondary">集數</label>
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
                          <label className="form-label-secondary">季數</label>
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
                          <label className="form-label-secondary">類型</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md form-select"
                            value={editingEpisode.type}
                            onChange={(e) =>
                              setEditingEpisode({
                                ...editingEpisode,
                                type: e.target.value as any,
                              })
                            }
                          >
                            {availableEpisodeTypes.map((episodeType) => (
                              <option key={episodeType} value={episodeType}>
                                {getEpisodeTypeLabel(episodeType)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="form-label-secondary">標題</label>
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
                        <div className="col-span-1 sm:col-span-2">
                          <label className="form-label-secondary">描述</label>
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
                        <div className="col-span-1 sm:col-span-2">
                          <label className="form-label-secondary">備註</label>
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
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
