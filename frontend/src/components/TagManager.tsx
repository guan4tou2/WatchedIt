"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/types";
import { Plus, Edit, Trash2, X, Check } from "lucide-react";

interface TagManagerProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  disabled?: boolean;
}

export default function TagManager({
  tags,
  onTagsChange,
  disabled = false,
}: TagManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    name: "",
    color: "#3B82F6", // 預設藍色
  });

  // 預設標籤顏色選項
  const colorOptions = [
    "#3B82F6", // 藍色
    "#EF4444", // 紅色
    "#10B981", // 綠色
    "#F59E0B", // 黃色
    "#8B5CF6", // 紫色
    "#F97316", // 橙色
    "#EC4899", // 粉色
    "#6B7280", // 灰色
  ];

  const handleAddTag = () => {
    if (!newTag.name.trim()) return;

    // 檢查標籤名稱是否已存在
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === newTag.name.toLowerCase()
    );

    if (existingTag) {
      alert("標籤名稱已存在！");
      return;
    }

    const tag: Tag = {
      id: Math.max(0, ...tags.map((t) => t.id)) + 1,
      name: newTag.name.trim(),
      color: newTag.color,
    };

    const updatedTags = [...tags, tag];
    onTagsChange(updatedTags);

    // 重置表單
    setNewTag({ name: "", color: "#3B82F6" });
    setIsAdding(false);
  };

  const handleUpdateTag = (tag: Tag) => {
    if (!tag.name.trim()) return;

    // 檢查標籤名稱是否已存在（排除自己）
    const existingTag = tags.find(
      (t) => t.id !== tag.id && t.name.toLowerCase() === tag.name.toLowerCase()
    );

    if (existingTag) {
      alert("標籤名稱已存在！");
      return;
    }

    const updatedTags = tags.map((t) => (t.id === tag.id ? tag : t));
    onTagsChange(updatedTags);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: number) => {
    if (confirm("確定要刪除這個標籤嗎？")) {
      const updatedTags = tags.filter((tag) => tag.id !== tagId);
      onTagsChange(updatedTags);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">標籤管理</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="stats-text">已建立: {tags.length} 個標籤</span>
            {!disabled && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-1" />
                新增標籤
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 新增標籤表單 */}
        {isAdding && (
          <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-secondary">標籤名稱</label>
                  <Input
                    value={newTag.name}
                    onChange={(e) =>
                      setNewTag({ ...newTag, name: e.target.value })
                    }
                    placeholder="輸入標籤名稱"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="form-label-secondary">顏色</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-8 h-8 rounded border" />
                    <select
                      value={newTag.color}
                      onChange={(e) =>
                        setNewTag({ ...newTag, color: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-md form-select"
                    >
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button size="sm" onClick={handleAddTag}>
                  <Check className="w-4 h-4 mr-1" />
                  新增
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTag({ name: "", color: "#3B82F6" });
                  }}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 標籤列表 */}
        <div className="space-y-2">
          {tags.length === 0 ? (
            <div className="text-center py-8 empty-state">
              還沒有標籤，點擊「新增標籤」開始添加
            </div>
          ) : (
            tags.map((tag) => (
              <div key={tag.id}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge>{tag.name}</Badge>
                        <div className="w-4 h-4 rounded border" />
                      </div>
                      <div className="flex items-center space-x-1">
                        {!disabled && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingTag(tag)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="error-text-hover"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 編輯標籤表單 */}
                {editingTag && editingTag.id === tag.id && (
                  <Card className="mt-2 border-2 border-dashed border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label-secondary">
                            標籤名稱
                          </label>
                          <Input
                            value={editingTag.name}
                            onChange={(e) =>
                              setEditingTag({
                                ...editingTag,
                                name: e.target.value,
                              })
                            }
                            placeholder="輸入標籤名稱"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="form-label-secondary">顏色</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-8 h-8 rounded border" />
                            <select
                              value={editingTag.color}
                              onChange={(e) =>
                                setEditingTag({
                                  ...editingTag,
                                  color: e.target.value,
                                })
                              }
                              className="flex-1 p-2 border rounded-md form-select"
                            >
                              {colorOptions.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTag(editingTag)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          更新
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTag(null)}
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
