"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Palette,
} from "lucide-react";
import { CustomEpisodeType, DEFAULT_EPISODE_TYPES } from "@/types";
import { customEpisodeTypeStorage } from "@/lib/customEpisodeTypes";

interface CustomEpisodeTypeManagerProps {
  onTypesChange?: (types: CustomEpisodeType[]) => void;
}

export default function CustomEpisodeTypeManager({
  onTypesChange,
}: CustomEpisodeTypeManagerProps) {
  const [episodeTypes, setEpisodeTypes] = useState<CustomEpisodeType[]>([]);
  const [editingType, setEditingType] = useState<CustomEpisodeType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadEpisodeTypes();
  }, []);

  const loadEpisodeTypes = () => {
    try {
      const types = customEpisodeTypeStorage.getAll();
      setEpisodeTypes(types);
      onTypesChange?.(types);
    } catch (error) {
      console.error("載入集數類型失敗:", error);
      setEpisodeTypes(DEFAULT_EPISODE_TYPES);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddType = () => {
    setIsAdding(true);
    setEditingType({
      id: "",
      name: "",
      label: "",
      color: "#3B82F6",
      icon: "📝",
      isDefault: false,
      isEnabled: true,
      createdAt: new Date().toISOString(),
    });
  };

  const handleEditType = (type: CustomEpisodeType) => {
    setEditingType({ ...type });
    setIsAdding(false);
  };

  const handleSaveType = () => {
    if (!editingType) return;

    try {
      // 驗證輸入
      if (!editingType.name.trim()) {
        showMessage("error", "請輸入類型名稱");
        return;
      }

      if (!editingType.label.trim()) {
        showMessage("error", "請輸入顯示標籤");
        return;
      }

      if (!editingType.color) {
        showMessage("error", "請選擇顏色");
        return;
      }

      // 檢查名稱重複
      if (customEpisodeTypeStorage.isNameDuplicate(editingType.name, editingType.id)) {
        showMessage("error", "類型名稱已存在");
        return;
      }

      if (isAdding) {
        // 新增類型
        const newType = customEpisodeTypeStorage.create({
          name: editingType.name.trim(),
          label: editingType.label.trim(),
          color: editingType.color,
          icon: editingType.icon || "📝",
          isDefault: false,
          isEnabled: editingType.isEnabled,
        });

        showMessage("success", `成功新增集數類型「${newType.label}」`);
      } else {
        // 更新類型
        if (!editingType.id) return;

        const updatedType = customEpisodeTypeStorage.update(editingType.id, {
          name: editingType.name.trim(),
          label: editingType.label.trim(),
          color: editingType.color,
          icon: editingType.icon || "📝",
          isEnabled: editingType.isEnabled,
        });

        if (updatedType) {
          showMessage("success", `成功更新集數類型「${updatedType.label}」`);
        } else {
          showMessage("error", "更新失敗");
        }
      }

      setEditingType(null);
      setIsAdding(false);
      loadEpisodeTypes();
    } catch (error) {
      console.error("儲存集數類型失敗:", error);
      showMessage("error", error instanceof Error ? error.message : "儲存失敗");
    }
  };

  const handleDeleteType = (type: CustomEpisodeType) => {
    if (type.isDefault) {
      showMessage("error", "無法刪除預設的集數類型");
      return;
    }

    if (confirm(`確定要刪除集數類型「${type.label}」嗎？`)) {
      try {
        customEpisodeTypeStorage.delete(type.id);
        showMessage("success", `成功刪除集數類型「${type.label}」`);
        loadEpisodeTypes();
      } catch (error) {
        console.error("刪除集數類型失敗:", error);
        showMessage("error", error instanceof Error ? error.message : "刪除失敗");
      }
    }
  };

  const handleToggleEnabled = (type: CustomEpisodeType) => {
    try {
      customEpisodeTypeStorage.toggleEnabled(type.id);
      loadEpisodeTypes();
    } catch (error) {
      console.error("切換啟用狀態失敗:", error);
      showMessage("error", "切換失敗");
    }
  };

  const handleResetToDefault = () => {
    if (confirm("確定要重置為預設集數類型嗎？這將清除所有自訂類型。")) {
      try {
        customEpisodeTypeStorage.resetToDefault();
        showMessage("success", "已重置為預設集數類型");
        loadEpisodeTypes();
      } catch (error) {
        console.error("重置集數類型失敗:", error);
        showMessage("error", "重置失敗");
      }
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* 訊息顯示 */}
      {message && (
        <div
          className={`p-3 rounded-md flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
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
                  新增集數類型
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  編輯集數類型
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">類型名稱 *</Label>
                <p className="text-xs text-gray-600">用於系統識別的英文名稱</p>
                <Input
                  value={editingType.name}
                  onChange={(e) =>
                    setEditingType({ ...editingType, name: e.target.value })
                  }
                  placeholder="例如：episode"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">顯示標籤 *</Label>
                <p className="text-xs text-gray-600">顯示給用戶看的中文名稱</p>
                <Input
                  value={editingType.label}
                  onChange={(e) =>
                    setEditingType({ ...editingType, label: e.target.value })
                  }
                  placeholder="例如：正篇"
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
                  <span className="text-sm text-gray-600">{editingType.color}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">啟用</Label>
                <p className="text-xs text-gray-600">是否啟用此類型</p>
              </div>
              <Switch
                checked={editingType.isEnabled}
                onCheckedChange={(checked) =>
                  setEditingType({ ...editingType, isEnabled: checked })
                }
              />
            </div>

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
            <CardTitle>集數類型</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddType} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                新增類型
              </Button>
              <Button onClick={handleResetToDefault} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                重置預設
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {episodeTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.name}</div>
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
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!type.isDefault && (
                    <Button
                      onClick={() => handleDeleteType(type)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
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
    </div>
  );
} 