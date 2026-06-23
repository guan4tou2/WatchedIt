"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { WorkType, workTypeStorage, DEFAULT_WORK_TYPES } from "@/lib/workTypes";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";
import { customEpisodeTypeStorage } from "@/lib/customEpisodeTypes";
import {
  EpisodeType,
  DEFAULT_WORK_TYPE_EPISODE_MAPPING,
  CustomEpisodeType,
} from "@/types";

interface WorkTypeManagerProps {
  onTypesChange?: (types: WorkType[]) => void;
}

export default function WorkTypeManager({
  onTypesChange,
}: WorkTypeManagerProps) {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEpisodeMapping, setEditingEpisodeMapping] = useState<{
    episodeTypes: EpisodeType[];
    defaultEpisodeType: EpisodeType;
  } | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<WorkType | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [availableEpisodeTypes, setAvailableEpisodeTypes] = useState<
    CustomEpisodeType[]
  >([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadWorkTypes = useCallback(() => {
    try {
      const types = workTypeStorage.getAll();
      setWorkTypes(types);
      onTypesChange?.(types);
    } catch (error) {
      console.error("載入作品類型失敗:", error);
      setWorkTypes(DEFAULT_WORK_TYPES);
    }
  }, [onTypesChange]);

  const loadEpisodeTypes = () => {
    try {
      const types = customEpisodeTypeStorage.getEnabledTypes();
      setAvailableEpisodeTypes(types);
    } catch (error) {
      console.error("載入集數類型失敗:", error);
    }
  };

  useEffect(() => {
    loadWorkTypes();
    loadEpisodeTypes();
  }, [loadWorkTypes]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddType = () => {
    setIsAdding(true);
    setEditingType({
      id: "",
      name: "",
      color: "#3B82F6",
      icon: "📝",
      description: "",
      isDefault: false,
      isEnabled: true,
      createdAt: new Date().toISOString(),
    });

    // 設定預設集數類型
    const enabledTypes = customEpisodeTypeStorage.getEnabledTypes();
    if (enabledTypes.length > 0) {
      setEditingEpisodeMapping({
        episodeTypes: [enabledTypes[0].name],
        defaultEpisodeType: enabledTypes[0].name,
      });
    }
  };

  const handleEditType = (type: WorkType) => {
    setEditingType({ ...type });
    setIsAdding(false);

    // 載入對應的集數類型設定
    try {
      const mapping = workTypeEpisodeMappingStorage.getByWorkType(type.name);
      if (mapping) {
        setEditingEpisodeMapping({
          episodeTypes: mapping.episodeTypes,
          defaultEpisodeType: mapping.defaultEpisodeType,
        });
      } else {
        // 使用預設設定
        const defaultMapping = DEFAULT_WORK_TYPE_EPISODE_MAPPING.find(
          (m) => m.workType === type.name
        );
        setEditingEpisodeMapping({
          episodeTypes: defaultMapping?.episodeTypes || ["episode"],
          defaultEpisodeType: defaultMapping?.defaultEpisodeType || "episode",
        });
      }
    } catch (error) {
      console.error("載入集數類型設定失敗:", error);
      // 使用預設設定
      setEditingEpisodeMapping({
        episodeTypes: ["episode"],
        defaultEpisodeType: "episode",
      });
    }
  };

  const handleSaveType = () => {
    if (!editingType || !editingEpisodeMapping) return;

    try {
      // 驗證輸入
      if (!editingType.name.trim()) {
        showMessage("error", "請輸入類型名稱");
        return;
      }

      if (!editingType.color) {
        showMessage("error", "請選擇顏色");
        return;
      }

      // 驗證集數類型設定
      if (editingEpisodeMapping.episodeTypes.length === 0) {
        showMessage("error", "請至少選擇一個集數類型");
        return;
      }

      if (
        !editingEpisodeMapping.episodeTypes.includes(
          editingEpisodeMapping.defaultEpisodeType
        )
      ) {
        showMessage("error", "預設集數類型必須在可用的集數類型中");
        return;
      }

      // 檢查名稱重複
      if (workTypeStorage.isNameDuplicate(editingType.name, editingType.id)) {
        showMessage("error", "類型名稱已存在");
        return;
      }

      if (isAdding) {
        // 新增類型
        const newType = workTypeStorage.create({
          name: editingType.name.trim(),
          color: editingType.color,
          icon: editingType.icon || "📝",
          description: editingType.description?.trim() || "",
          isDefault: false,
          isEnabled: editingType.isEnabled,
        });

        // 新增集數類型對應
        try {
          workTypeEpisodeMappingStorage.create({
            workType: newType.name,
            episodeTypes: editingEpisodeMapping.episodeTypes,
            defaultEpisodeType: editingEpisodeMapping.defaultEpisodeType,
          });
        } catch (error) {
          console.error("新增集數類型對應失敗:", error);
        }

        showMessage("success", `成功新增類型「${newType.name}」`);
      } else {
        // 更新類型
        if (!editingType.id) return;

        const oldName = workTypeStorage
          .getAll()
          .find((t) => t.id === editingType.id)?.name;
        const updatedType = workTypeStorage.update(editingType.id, {
          name: editingType.name.trim(),
          color: editingType.color,
          icon: editingType.icon || "📝",
          description: editingType.description?.trim() || "",
          isEnabled: editingType.isEnabled,
        });

        if (updatedType) {
          // 更新集數類型對應
          try {
            if (oldName && oldName !== updatedType.name) {
              // 如果名稱改變，刪除舊的對應關係
              workTypeEpisodeMappingStorage.delete(oldName);
            }

            // 新增或更新對應關係
            const existingMapping = workTypeEpisodeMappingStorage.getByWorkType(
              updatedType.name
            );
            if (existingMapping) {
              workTypeEpisodeMappingStorage.update(updatedType.name, {
                episodeTypes: editingEpisodeMapping.episodeTypes,
                defaultEpisodeType: editingEpisodeMapping.defaultEpisodeType,
              });
            } else {
              workTypeEpisodeMappingStorage.create({
                workType: updatedType.name,
                episodeTypes: editingEpisodeMapping.episodeTypes,
                defaultEpisodeType: editingEpisodeMapping.defaultEpisodeType,
              });
            }
          } catch (error) {
            console.error("更新集數類型對應失敗:", error);
          }

          showMessage("success", `成功更新類型「${updatedType.name}」`);
        } else {
          showMessage("error", "更新失敗");
        }
      }

      setEditingType(null);
      setEditingEpisodeMapping(null);
      setIsAdding(false);
      loadWorkTypes();
    } catch (error) {
      console.error("儲存作品類型失敗:", error);
      showMessage("error", error instanceof Error ? error.message : "儲存失敗");
    }
  };

  const handleDeleteType = (type: WorkType) => {
    if (type.isDefault) {
      showMessage("error", "無法刪除預設的作品類型");
      return;
    }

    setTypeToDelete(type);
  };

  const confirmDeleteType = () => {
    if (!typeToDelete) return;

    try {
      workTypeStorage.delete(typeToDelete.id);

      // 同時刪除集數類型對應
      try {
        workTypeEpisodeMappingStorage.delete(typeToDelete.name);
      } catch (error) {
        console.error("刪除集數類型對應失敗:", error);
      }

      showMessage("success", `成功刪除類型「${typeToDelete.name}」`);
      setTypeToDelete(null);
      loadWorkTypes();
    } catch (error) {
      console.error("刪除作品類型失敗:", error);
      showMessage("error", error instanceof Error ? error.message : "刪除失敗");
    }
  };

  const handleToggleEnabled = (type: WorkType) => {
    try {
      workTypeStorage.toggleEnabled(type.id);
      loadWorkTypes();
    } catch (error) {
      console.error("切換啟用狀態失敗:", error);
      showMessage("error", "切換失敗");
    }
  };

  const handleResetToDefault = () => {
    setResetDialogOpen(true);
  };

  const confirmResetToDefault = () => {
    try {
      workTypeStorage.resetToDefault();

      // 同時重置集數類型對應
      try {
        workTypeEpisodeMappingStorage.resetToDefault();
      } catch (error) {
        console.error("重置集數類型對應失敗:", error);
      }

      setResetDialogOpen(false);
      showMessage("success", "已重置為預設類型");
      loadWorkTypes();
    } catch (error) {
      console.error("重置作品類型失敗:", error);
      showMessage("error", "重置失敗");
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setEditingEpisodeMapping(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* 訊息顯示 */}
      {message && (
        <div
          className={`p-3 rounded-md flex items-center gap-2 ${message.type === "success"
            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* 編輯表單 */}
      {editingType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAdding ? (
                <>
                  <Plus className="w-5 h-5" />
                  新增作品類型
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  編輯作品類型
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">類型名稱 *</Label>
                <Input
                  value={editingType.name}
                  onChange={(e) =>
                    setEditingType({ ...editingType, name: e.target.value })
                  }
                  placeholder="例如：動畫"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">描述</Label>
                <Input
                  value={editingType.description}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      description: e.target.value,
                    })
                  }
                  placeholder="可選的描述"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">圖示</Label>
                <Input
                  value={editingType.icon}
                  onChange={(e) =>
                    setEditingType({ ...editingType, icon: e.target.value })
                  }
                  placeholder="例如：📺"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">顏色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={editingType.color}
                    onChange={(e) =>
                      setEditingType({ ...editingType, color: e.target.value })
                    }
                    className="w-10 h-10 rounded border"
                  />
                  <span className="description-container">
                    {editingType.color}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">啟用</Label>
                <p className="text-xs-muted">是否啟用此類型</p>
              </div>
              <Switch
                checked={editingType.isEnabled}
                onCheckedChange={(checked) =>
                  setEditingType({ ...editingType, isEnabled: checked })
                }
              />
            </div>

            {/* 集數類型設定 */}
            {editingEpisodeMapping && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label className="text-sm font-medium">集數類型設定</Label>
                  <p className="text-xs-muted">設定此作品類型可用的集數類型</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    可用的集數類型 *
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableEpisodeTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center space-x-2"
                      >
                        <Switch
                          checked={editingEpisodeMapping.episodeTypes.includes(
                            type.name
                          )}
                          onCheckedChange={() => {
                            const newEpisodeTypes =
                              editingEpisodeMapping.episodeTypes.includes(
                                type.name
                              )
                                ? editingEpisodeMapping.episodeTypes.filter(
                                  (t) => t !== type.name
                                )
                                : [
                                  ...editingEpisodeMapping.episodeTypes,
                                  type.name,
                                ];

                            setEditingEpisodeMapping({
                              ...editingEpisodeMapping,
                              episodeTypes: newEpisodeTypes,
                            });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs">
                            {type.icon}
                          </div>
                          <Label className="text-sm">{type.label}</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">預設集數類型 *</Label>
                  <select
                    value={editingEpisodeMapping.defaultEpisodeType}
                    onChange={(e) =>
                      setEditingEpisodeMapping({
                        ...editingEpisodeMapping,
                        defaultEpisodeType: e.target.value,
                      })
                    }
                    className="w-full mt-1 p-2 border rounded-md dark:text-foreground/95 dark:bg-background/95"
                    required
                  >
                    {editingEpisodeMapping.episodeTypes.map((type) => {
                      const episodeType = availableEpisodeTypes.find(
                        (t) => t.name === type
                      );
                      return (
                        <option key={type} value={type}>
                          {episodeType?.label || type}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSaveType}>
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

      {/* 類型列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>作品類型</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddType} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                新增類型
              </Button>
              <Button
                onClick={handleResetToDefault}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重置預設
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white">
                    {type.icon}
                  </div>
                  <div>
                    <div className="font-medium">{type.name}</div>
                    {type.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {type.description}
                      </div>
                    )}
                  </div>
                  {type.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      預設
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={type.isEnabled}
                    onCheckedChange={() => handleToggleEnabled(type)}
                  />
                  <Button
                    onClick={() => handleEditType(type)}
                    variant="outline"
                    size="sm"
                    aria-label={`編輯${type.name}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!type.isDefault && (
                    <Button
                      onClick={() => handleDeleteType(type)}
                      variant="outline"
                      size="sm"
                      aria-label={`刪除${type.name}`}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(typeToDelete)}
        onOpenChange={(open) => {
          if (!open) setTypeToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>刪除作品類型</AlertDialogTitle>
            <AlertDialogDescription>
              {typeToDelete
                ? `將刪除「${typeToDelete.name}」及其集數類型對應，且無法復原。`
                : "此操作無法復原。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteType}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置作品類型</AlertDialogTitle>
            <AlertDialogDescription>
              將清除所有自訂作品類型與集數類型對應，並恢復預設設定。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetToDefault}>
              確認重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
