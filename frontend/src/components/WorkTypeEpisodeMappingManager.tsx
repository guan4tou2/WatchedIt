"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
} from "lucide-react";
import {
  WorkTypeEpisodeMapping,
  EpisodeType,
  DEFAULT_WORK_TYPE_EPISODE_MAPPING,
} from "@/types";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";
import { workTypeStorage } from "@/lib/workTypes";

interface WorkTypeEpisodeMappingManagerProps {
  onMappingChange?: (mappings: WorkTypeEpisodeMapping[]) => void;
}

const EPISODE_TYPE_LABELS: Record<EpisodeType, string> = {
  episode: "正篇",
  special: "特別篇",
  ova: "OVA",
  movie: "電影",
  chapter: "章節",
};

export default function WorkTypeEpisodeMappingManager({
  onMappingChange,
}: WorkTypeEpisodeMappingManagerProps) {
  const [mappings, setMappings] = useState<WorkTypeEpisodeMapping[]>([]);
  const [editingMapping, setEditingMapping] =
    useState<WorkTypeEpisodeMapping | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = () => {
    try {
      const loadedMappings = workTypeEpisodeMappingStorage.getAll();
      setMappings(loadedMappings);
      onMappingChange?.(loadedMappings);
    } catch (error) {
      console.error("載入對應關係失敗:", error);
      setMappings(DEFAULT_WORK_TYPE_EPISODE_MAPPING);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddMapping = () => {
    setIsAdding(true);
    setEditingMapping({
      workType: "",
      episodeTypes: ["episode"],
      defaultEpisodeType: "episode",
    });
  };

  const handleEditMapping = (mapping: WorkTypeEpisodeMapping) => {
    setEditingMapping({ ...mapping });
    setIsAdding(false);
  };

  const handleSaveMapping = () => {
    if (!editingMapping) return;

    try {
      // 驗證輸入
      if (!editingMapping.workType.trim()) {
        showMessage("error", "請選擇作品類型");
        return;
      }

      if (editingMapping.episodeTypes.length === 0) {
        showMessage("error", "請至少選擇一個集數類型");
        return;
      }

      if (
        !editingMapping.episodeTypes.includes(editingMapping.defaultEpisodeType)
      ) {
        showMessage("error", "預設集數類型必須在可用的集數類型中");
        return;
      }

      if (isAdding) {
        // 新增對應關係
        const newMapping = workTypeEpisodeMappingStorage.create({
          workType: editingMapping.workType.trim(),
          episodeTypes: editingMapping.episodeTypes,
          defaultEpisodeType: editingMapping.defaultEpisodeType,
        });
        showMessage("success", `成功新增對應關係「${newMapping.workType}」`);
      } else {
        // 更新對應關係
        const updatedMapping = workTypeEpisodeMappingStorage.update(
          editingMapping.workType,
          {
            episodeTypes: editingMapping.episodeTypes,
            defaultEpisodeType: editingMapping.defaultEpisodeType,
          }
        );

        if (updatedMapping) {
          showMessage(
            "success",
            `成功更新對應關係「${updatedMapping.workType}」`
          );
        }
      }

      setEditingMapping(null);
      loadMappings();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "操作失敗");
    }
  };

  const handleDeleteMapping = (mapping: WorkTypeEpisodeMapping) => {
    if (confirm(`確定要刪除對應關係「${mapping.workType}」嗎？`)) {
      try {
        workTypeEpisodeMappingStorage.delete(mapping.workType);
        showMessage("success", `成功刪除對應關係「${mapping.workType}」`);
        loadMappings();
      } catch (error) {
        showMessage(
          "error",
          error instanceof Error ? error.message : "刪除失敗"
        );
      }
    }
  };

  const handleResetToDefault = () => {
    if (confirm("確定要重置為預設對應關係嗎？這將清除所有自訂對應關係。")) {
      try {
        workTypeEpisodeMappingStorage.resetToDefault();
        showMessage("success", "已重置為預設對應關係");
        loadMappings();
      } catch (error) {
        showMessage("error", "重置失敗");
      }
    }
  };

  const handleCancel = () => {
    setEditingMapping(null);
  };

  const toggleEpisodeType = (episodeType: EpisodeType) => {
    if (!editingMapping) return;

    const newEpisodeTypes = editingMapping.episodeTypes.includes(episodeType)
      ? editingMapping.episodeTypes.filter((t) => t !== episodeType)
      : [...editingMapping.episodeTypes, episodeType];

    setEditingMapping({
      ...editingMapping,
      episodeTypes: newEpisodeTypes,
    });
  };

  const setDefaultEpisodeType = (episodeType: EpisodeType) => {
    if (!editingMapping) return;

    setEditingMapping({
      ...editingMapping,
      defaultEpisodeType: episodeType,
    });
  };

  // 取得可用的作品類型（從 workTypeStorage）
  const getAvailableWorkTypes = () => {
    try {
      return workTypeStorage.getEnabled().map((type) => type.name);
    } catch (error) {
      return ["動畫", "電影", "電視劇", "小說", "漫畫", "遊戲"];
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-md flex items-center ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <AlertTriangle className="w-4 h-4 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* 編輯表單 */}
      {editingMapping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isAdding ? "新增對應關係" : "編輯對應關係"}
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">作品類型 *</Label>
              <select
                value={editingMapping.workType}
                onChange={(e) =>
                  setEditingMapping({
                    ...editingMapping,
                    workType: e.target.value,
                  })
                }
                className="w-full mt-1 p-2 border rounded-md"
                required
              >
                <option value="">請選擇作品類型</option>
                {getAvailableWorkTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium">集數類型 *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(EPISODE_TYPE_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Switch
                      checked={editingMapping.episodeTypes.includes(
                        type as EpisodeType
                      )}
                      onCheckedChange={() =>
                        toggleEpisodeType(type as EpisodeType)
                      }
                    />
                    <Label className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">預設集數類型 *</Label>
              <select
                value={editingMapping.defaultEpisodeType}
                onChange={(e) =>
                  setDefaultEpisodeType(e.target.value as EpisodeType)
                }
                className="w-full mt-1 p-2 border rounded-md"
                required
              >
                {editingMapping.episodeTypes.map((type) => (
                  <option key={type} value={type}>
                    {EPISODE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMapping}>
                <Save className="w-4 h-4 mr-2" />
                儲存
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 對應關係列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>作品類型與集數類型對應</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddMapping} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                新增對應
              </Button>
              <Button onClick={handleResetToDefault} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                重置預設
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mappings.map((mapping) => (
              <div
                key={mapping.workType}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{mapping.workType}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {mapping.episodeTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={
                            type === mapping.defaultEpisodeType
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {EPISODE_TYPE_LABELS[type]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMapping(mapping)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMapping(mapping)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
