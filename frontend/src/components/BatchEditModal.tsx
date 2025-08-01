"use client";

import { useState } from "react";
import { Work, WorkUpdate, Tag } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Edit3, Check, AlertTriangle } from "lucide-react";

interface BatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorks: Work[];
  allTags: Tag[];
  onBatchUpdate: (updates: WorkUpdate) => Promise<void>;
}

interface BatchEditForm {
  status?: "進行中" | "已完結" | "暫停" | "放棄" | "未播出" | "已取消";
  type?: string;
  year?: number;
  rating?: number;
  tags?: Tag[];
  reminder_enabled?: boolean;
  reminder_frequency?: "daily" | "weekly" | "monthly" | "custom";
}

export default function BatchEditModal({
  isOpen,
  onClose,
  selectedWorks,
  allTags,
  onBatchUpdate,
}: BatchEditModalProps) {
  const [form, setForm] = useState<BatchEditForm>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (Object.keys(form).length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onBatchUpdate(form);
      handleClose();
    } catch (error) {
      console.error("批量更新失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({});
    setShowConfirm(false);
    onClose();
  };

  const handleTagToggle = (tag: Tag) => {
    setForm((prev) => {
      const currentTags = prev.tags || [];
      const isSelected = currentTags.some((t) => t.id === tag.id);

      if (isSelected) {
        return {
          ...prev,
          tags: currentTags.filter((t) => t.id !== tag.id),
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tag],
        };
      }
    });
  };

  const getSelectedTags = () => {
    return form.tags || [];
  };

  const getUniqueValues = (field: keyof Work) => {
    const values = selectedWorks.map((work) => work[field]).filter(Boolean);
    return Array.from(new Set(values));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "進行中":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "已完結":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "暫停":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "放棄":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      default:
        return "badge-unselected";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "動畫":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "電影":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      case "電視劇":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "小說":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "漫畫":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
      case "遊戲":
        return "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200";
      default:
        return "badge-unselected";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5" />
                <span>批量編輯 ({selectedWorks.length} 個作品)</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 選中的作品列表 */}
            <div>
              <h3 className="text-sm font-medium mb-3">選中的作品</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedWorks.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                  >
                    <span className="text-sm truncate">{work.title}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(work.status)}>
                        {work.status}
                      </Badge>
                      <Badge className={getTypeColor(work.type)}>
                        {work.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 批量編輯表單 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">編輯選項</h3>

              {/* 狀態 */}
              <div>
                <label className="text-sm font-medium">狀態</label>
                <Select
                  value={form.status || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status:
                        (value as
                          | "進行中"
                          | "已完結"
                          | "暫停"
                          | "放棄"
                          | "未播出"
                          | "已取消") || undefined,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">保持原狀</SelectItem>
                    <SelectItem value="進行中">進行中</SelectItem>
                    <SelectItem value="已完結">已完結</SelectItem>
                    <SelectItem value="暫停">暫停</SelectItem>
                    <SelectItem value="放棄">放棄</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 類型 */}
              <div>
                <label className="text-sm font-medium">類型</label>
                <Select
                  value={form.type || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value || undefined }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">保持原狀</SelectItem>
                    <SelectItem value="動畫">動畫</SelectItem>
                    <SelectItem value="電影">電影</SelectItem>
                    <SelectItem value="電視劇">電視劇</SelectItem>
                    <SelectItem value="小說">小說</SelectItem>
                    <SelectItem value="漫畫">漫畫</SelectItem>
                    <SelectItem value="遊戲">遊戲</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 年份 */}
              <div>
                <label className="text-sm font-medium">年份</label>
                <Select
                  value={form.year?.toString() || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      year: value ? parseInt(value) : undefined,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇年份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">保持原狀</SelectItem>
                    {Array.from(
                      { length: 30 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 評分 */}
              <div>
                <label className="text-sm font-medium">評分</label>
                <Select
                  value={form.rating?.toString() || ""}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      rating: value ? parseInt(value) : undefined,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇評分" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">保持原狀</SelectItem>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} 分
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 標籤 */}
              <div>
                <label className="text-sm font-medium">標籤</label>
                <div className="mt-1 space-y-2">
                  {/* 已選擇的標籤 */}
                  {getSelectedTags().length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {getSelectedTags().map((tag) => (
                        <Badge
                          key={tag.id}
                          className="flex items-center space-x-1"
                        >
                          <span>{tag.name}</span>
                          <button
                            onClick={() => handleTagToggle(tag)}
                            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 標籤選擇器 */}
                  <div className="relative">
                    <Select
                      onValueChange={(value) => {
                        const tag = allTags.find(
                          (t) => t.id.toString() === value
                        );
                        if (tag) {
                          handleTagToggle(tag);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇標籤" />
                      </SelectTrigger>
                      <SelectContent>
                        {allTags
                          .filter(
                            (tag) =>
                              !getSelectedTags().some((t) => t.id === tag.id)
                          )
                          .map((tag) => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              {tag.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 提醒設定 */}
              <div>
                <label className="text-sm font-medium">提醒設定</label>
                <div className="mt-1 space-y-2">
                  <Select
                    value={form.reminder_enabled?.toString() || ""}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        reminder_enabled:
                          value === "true"
                            ? true
                            : value === "false"
                            ? false
                            : undefined,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="提醒狀態" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">保持原狀</SelectItem>
                      <SelectItem value="true">啟用提醒</SelectItem>
                      <SelectItem value="false">停用提醒</SelectItem>
                    </SelectContent>
                  </Select>

                  {form.reminder_enabled && (
                    <Select
                      value={form.reminder_frequency || ""}
                      onValueChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          reminder_frequency:
                            (value as
                              | "daily"
                              | "weekly"
                              | "monthly"
                              | "custom") || undefined,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="提醒頻率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">保持原狀</SelectItem>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="weekly">每週</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                        <SelectItem value="custom">自訂</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4" />
                <span>只有設定的欄位會被更新</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={Object.keys(form).length === 0 || isLoading}
                >
                  {isLoading ? "更新中..." : "確認更新"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 確認對話框 */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認批量更新</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要對 {selectedWorks.length}{" "}
              個作品進行批量更新嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              確認更新
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
