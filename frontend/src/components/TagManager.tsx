"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Tag } from "@/types";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("TagManager");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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
      setFormError(t("errors.duplicate"));
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
    setFormError(null);
    setIsAdding(false);
  };

  const handleUpdateTag = (tag: Tag) => {
    if (!tag.name.trim()) return;

    // 檢查標籤名稱是否已存在（排除自己）
    const existingTag = tags.find(
      (t) => t.id !== tag.id && t.name.toLowerCase() === tag.name.toLowerCase()
    );

    if (existingTag) {
      setFormError(t("errors.duplicate"));
      return;
    }

    const updatedTags = tags.map((t) => (t.id === tag.id ? tag : t));
    onTagsChange(updatedTags);
    setFormError(null);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId: number) => {
    const tag = tags.find((item) => item.id === tagId);
    if (!tag) return;

    setTagToDelete(tag);
  };

  const confirmDeleteTag = () => {
    if (!tagToDelete) return;

    const updatedTags = tags.filter((tag) => tag.id !== tagToDelete.id);
    onTagsChange(updatedTags);
    setTagToDelete(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="stats-text">
              {t("stats", { count: tags.length })}
            </span>
            {!disabled && (
              <Button
                size="sm"
                onClick={() => {
                  setFormError(null);
                  setIsAdding(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                {t("buttons.add")}
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
              {formError && (
                <div className="error-container mb-4 p-3 rounded" role="alert">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-secondary" htmlFor="new-tag-name">
                    {t("labels.name")}
                  </label>
                  <Input
                    id="new-tag-name"
                    value={newTag.name}
                    onChange={(e) => {
                      setNewTag({ ...newTag, name: e.target.value });
                      setFormError(null);
                    }}
                    placeholder={t("placeholders.name")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="form-label-secondary" htmlFor="new-tag-color">
                    {t("labels.color")}
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className="w-8 h-8 rounded border"
                      aria-label={t("selectedColor")}
                      style={{ backgroundColor: newTag.color }}
                    />
                    <select
                      id="new-tag-color"
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
                  {t("buttons.confirmAdd")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTag({ name: "", color: "#3B82F6" });
                    setFormError(null);
                  }}
                >
                  {t("buttons.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 標籤列表 */}
        <div className="space-y-2">
          {tags.length === 0 ? (
            <div className="text-center py-8 empty-state">
              {t("empty")}
            </div>
          ) : (
            tags.map((tag) => (
              <div key={tag.id}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge>{tag.name}</Badge>
                        <div
                          className="w-4 h-4 rounded border"
                          aria-label={t("colorSwatch", { name: tag.name })}
                          style={{ backgroundColor: tag.color }}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        {!disabled && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setFormError(null);
                                setEditingTag(tag);
                              }}
                              aria-label={t("buttons.edit", {
                                name: tag.name,
                              })}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="error-text-hover"
                              aria-label={t("buttons.delete", {
                                name: tag.name,
                              })}
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
                      {formError && (
                        <div
                          className="error-container mb-4 p-3 rounded"
                          role="alert"
                        >
                          {formError}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="form-label-secondary"
                            htmlFor={`edit-tag-name-${tag.id}`}
                          >
                            {t("labels.name")}
                          </label>
                          <Input
                            id={`edit-tag-name-${tag.id}`}
                            value={editingTag.name}
                            onChange={(e) => {
                              setEditingTag({
                                ...editingTag,
                                name: e.target.value,
                              });
                              setFormError(null);
                            }}
                            placeholder={t("placeholders.name")}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label
                            className="form-label-secondary"
                            htmlFor={`edit-tag-color-${tag.id}`}
                          >
                            {t("labels.color")}
                          </label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div
                              className="w-8 h-8 rounded border"
                              aria-label={t("selectedColor")}
                              style={{ backgroundColor: editingTag.color }}
                            />
                            <select
                              id={`edit-tag-color-${tag.id}`}
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
                          {t("buttons.update")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFormError(null);
                            setEditingTag(null);
                          }}
                        >
                          {t("buttons.cancel")}
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

      <AlertDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => {
          if (!open) setTagToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tagToDelete
                ? t("deleteDialog.description", { name: tagToDelete.name })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
