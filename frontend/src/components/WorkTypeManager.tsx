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
} from "lucide-react";
import { WorkType, workTypeStorage, DEFAULT_WORK_TYPES } from "@/lib/workTypes";

interface WorkTypeManagerProps {
  onTypesChange?: (types: WorkType[]) => void;
}

export default function WorkTypeManager({
  onTypesChange,
}: WorkTypeManagerProps) {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadWorkTypes();
  }, []);

  const loadWorkTypes = () => {
    try {
      const types = workTypeStorage.getAll();
      setWorkTypes(types);
      onTypesChange?.(types);
    } catch (error) {
      console.error("載入作品類型失敗:", error);
      setWorkTypes(DEFAULT_WORK_TYPES);
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
      color: "#3B82F6",
      icon: "📝",
      description: "",
      isDefault: false,
      isEnabled: true,
      createdAt: new Date().toISOString(),
    });
  };

  const handleEditType = (type: WorkType) => {
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

      if (!editingType.color) {
        showMessage("error", "請選擇顏色");
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
        showMessage("success", `成功新增類型「${newType.name}」`);
      } else {
        // 更新類型
        if (!editingType.id) return;

        const updatedType = workTypeStorage.update(editingType.id, {
          name: editingType.name.trim(),
          color: editingType.color,
          icon: editingType.icon || "📝",
          description: editingType.description?.trim() || "",
          isEnabled: editingType.isEnabled,
        });

        if (updatedType) {
          showMessage("success", `成功更新類型「${updatedType.name}」`);
        }
      }

      setEditingType(null);
      loadWorkTypes();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "操作失敗");
    }
  };

  const handleDeleteType = (type: WorkType) => {
    if (type.isDefault) {
      showMessage("error", "無法刪除預設類型");
      return;
    }

    if (confirm(`確定要刪除類型「${type.name}」嗎？`)) {
      try {
        workTypeStorage.delete(type.id);
        showMessage("success", `成功刪除類型「${type.name}」`);
        loadWorkTypes();
      } catch (error) {
        showMessage(
          "error",
          error instanceof Error ? error.message : "刪除失敗"
        );
      }
    }
  };

  const handleToggleEnabled = (type: WorkType) => {
    try {
      workTypeStorage.toggleEnabled(type.id);
      showMessage(
        "success",
        `成功${type.isEnabled ? "禁用" : "啟用"}類型「${type.name}」`
      );
      loadWorkTypes();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "操作失敗");
    }
  };

  const handleResetToDefault = () => {
    if (confirm("確定要重置為預設類型嗎？這將清除所有自訂類型。")) {
      try {
        workTypeStorage.resetToDefault();
        showMessage("success", "已重置為預設類型");
        loadWorkTypes();
      } catch (error) {
        showMessage("error", "重置失敗");
      }
    }
  };

  const handleCancel = () => {
    setEditingType(null);
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
      {editingType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isAdding ? "新增作品類型" : "編輯作品類型"}
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">類型名稱 *</Label>
                <Input
                  value={editingType.name}
                  onChange={(e) =>
                    setEditingType({ ...editingType, name: e.target.value })
                  }
                  placeholder="例如：動畫、電影、小說"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">顏色</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={editingType.color}
                    onChange={(e) =>
                      setEditingType({ ...editingType, color: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={editingType.color}
                    onChange={(e) =>
                      setEditingType({ ...editingType, color: e.target.value })
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">圖標</Label>
                <Input
                  value={editingType.icon || ""}
                  onChange={(e) =>
                    setEditingType({ ...editingType, icon: e.target.value })
                  }
                  placeholder="🎬"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">描述</Label>
                <Input
                  value={editingType.description || ""}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      description: e.target.value,
                    })
                  }
                  placeholder="類型描述"
                  className="mt-1"
                />
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
            <CardTitle>作品類型</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleAddType} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                新增類型
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
            {workTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon || "📝"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{type.name}</span>
                      {type.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          預設
                        </Badge>
                      )}
                      {!type.isEnabled && (
                        <Badge variant="outline" className="text-xs">
                          已禁用
                        </Badge>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={type.isEnabled}
                    onCheckedChange={() => handleToggleEnabled(type)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditType(type)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!type.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteType(type)}
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
