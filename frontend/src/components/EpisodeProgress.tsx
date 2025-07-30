"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EpisodeProgress } from "@/types";
import { Plus, Minus, Play, Pause, Check } from "lucide-react";

interface EpisodeProgressProps {
  progress?: EpisodeProgress;
  onProgressChange: (progress: EpisodeProgress) => void;
  type: "動畫" | "電影" | "電視劇" | "小說" | "漫畫" | "遊戲";
  disabled?: boolean;
}

export default function EpisodeProgressComponent({
  progress,
  onProgressChange,
  type,
  disabled = false,
}: EpisodeProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editProgress, setEditProgress] = useState<EpisodeProgress>(
    progress || { current: 0, total: undefined, special: 0, season: 1 }
  );

  const getEpisodeTypeLabel = () => {
    switch (type) {
      case "動畫":
      case "電視劇":
        return "集";
      case "小說":
        return "章";
      case "漫畫":
        return "話";
      case "遊戲":
        return "章節";
      case "電影":
        return "部";
      default:
        return "集";
    }
  };

  const getEpisodeType = () => {
    switch (type) {
      case "動畫":
      case "電視劇":
        return "episode";
      case "小說":
        return "chapter";
      case "漫畫":
        return "chapter";
      case "遊戲":
        return "chapter";
      case "電影":
        return "movie";
      default:
        return "episode";
    }
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newProgress = {
      ...editProgress,
      current: Math.min(editProgress.current + 1, editProgress.total || 999),
    };
    setEditProgress(newProgress);
    onProgressChange(newProgress);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newProgress = {
      ...editProgress,
      current: Math.max(editProgress.current - 1, 0),
    };
    setEditProgress(newProgress);
    onProgressChange(newProgress);
  };

  const handleSave = () => {
    onProgressChange(editProgress);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProgress(
      progress || { current: 0, total: undefined, special: 0, season: 1 }
    );
    setIsEditing(false);
  };

  const completionRate =
    progress?.total && progress.current !== undefined
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const episodeLabel = getEpisodeTypeLabel();
  const episodeType = getEpisodeType();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">進度管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 當前進度顯示 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">當前進度:</span>
            <span className="text-lg font-bold">
              {progress?.current || 0} {episodeLabel}
            </span>
            {progress?.total && (
              <span className="text-gray-500">
                / {progress.total} {episodeLabel}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecrement}
              disabled={disabled || (progress?.current || 0) <= 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleIncrement}
              disabled={
                disabled || (progress?.current || 0) >= (progress?.total || 999)
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 進度條 */}
        {progress?.total && progress.current !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>完成度</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* 編輯模式 */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  當前{episodeLabel}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editProgress.current}
                  onChange={(e) =>
                    setEditProgress({
                      ...editProgress,
                      current: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">總{episodeLabel}</label>
                <Input
                  type="number"
                  min="0"
                  value={editProgress.total || ""}
                  onChange={(e) =>
                    setEditProgress({
                      ...editProgress,
                      total: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="未知"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">季數</label>
                <Input
                  type="number"
                  min="1"
                  value={editProgress.season || 1}
                  onChange={(e) =>
                    setEditProgress({
                      ...editProgress,
                      season: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">特別篇</label>
                <Input
                  type="number"
                  min="0"
                  value={editProgress.special || 0}
                  onChange={(e) =>
                    setEditProgress({
                      ...editProgress,
                      special: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-1" />
                儲存
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 詳細資訊 */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>季數:</span>
                <span>{progress?.season || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>特別篇:</span>
                <span>{progress?.special || 0}</span>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={disabled}
              >
                <Play className="w-4 h-4 mr-1" />
                編輯進度
              </Button>
              {progress?.current && progress.current > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newProgress = {
                      ...progress,
                      current: progress.current - 1,
                    };
                    onProgressChange(newProgress);
                  }}
                  disabled={disabled}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  上一{episodeLabel}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 狀態指示器 */}
        <div className="flex items-center space-x-2 text-sm">
          {progress?.current === progress?.total && progress.total ? (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              已完成
            </div>
          ) : progress?.current && progress.current > 0 ? (
            <div className="flex items-center text-blue-600">
              <Play className="w-4 h-4 mr-1" />
              進行中
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <Pause className="w-4 h-4 mr-1" />
              未開始
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
