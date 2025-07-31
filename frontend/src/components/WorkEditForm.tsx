"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Work, WorkUpdate } from "@/types";
import { X, Save, Star } from "lucide-react";

interface WorkEditFormProps {
  work: Work;
  onSave: (updatedWork: WorkUpdate) => void;
  onCancel: () => void;
  isOpen: boolean;
  inline?: boolean;
}

export default function WorkEditForm({
  work,
  onSave,
  onCancel,
  isOpen,
  inline = false,
}: WorkEditFormProps) {
  const [formData, setFormData] = useState({
    title: work.title,
    type: work.type,
    status: work.status,
    year: work.year || "",
    rating: work.rating || "",
    review: work.review || "",
    note: work.note || "",
    source: work.source || "",
  });

  useEffect(() => {
    setFormData({
      title: work.title,
      type: work.type,
      status: work.status,
      year: work.year || "",
      rating: work.rating || "",
      review: work.review || "",
      note: work.note || "",
      source: work.source || "",
    });
  }, [work]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedWork: WorkUpdate = {
      title: formData.title,
      type: formData.type,
      status: formData.status,
      year: formData.year ? parseInt(formData.year.toString()) : undefined,
      rating: formData.rating
        ? parseInt(formData.rating.toString())
        : undefined,
      review: formData.review || undefined,
      note: formData.note || undefined,
      source: formData.source || undefined,
    };

    onSave(updatedWork);
  };

  const handleRatingClick = (rating: number) => {
    setFormData({
      ...formData,
      rating: formData.rating === rating.toString() ? "" : rating.toString(),
    });
  };

  if (!isOpen) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">標題</label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="作品標題"
            required
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">類型</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as Work["type"],
              })
            }
            className="w-full mt-1 p-2 border rounded-md"
            required
          >
            <option value="動畫">動畫</option>
            <option value="電影">電影</option>
            <option value="電視劇">電視劇</option>
            <option value="小說">小說</option>
            <option value="漫畫">漫畫</option>
            <option value="遊戲">遊戲</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">狀態</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as Work["status"],
              })
            }
            className="w-full mt-1 p-2 border rounded-md"
            required
          >
            <option value="進行中">進行中</option>
            <option value="已完成">已完成</option>
            <option value="暫停">暫停</option>
            <option value="放棄">放棄</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">年份</label>
          <Input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder="2023"
            min="1900"
            max="2030"
            className="mt-1"
          />
        </div>
      </div>

      {/* 評分 */}
      <div>
        <label className="text-sm font-medium text-gray-600">評分</label>
        <div className="flex items-center space-x-2 mt-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingClick(rating)}
              className={`p-2 rounded-md transition-colors ${
                parseInt(formData.rating.toString()) >= rating
                  ? "text-yellow-500 bg-yellow-50"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              <Star
                className="w-5 h-5"
                fill={
                  parseInt(formData.rating.toString()) >= rating
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          ))}
          {formData.rating && (
            <span className="text-sm text-gray-600 ml-2">
              {formData.rating}/5
            </span>
          )}
        </div>
      </div>

      {/* 評論 */}
      <div>
        <label className="text-sm font-medium text-gray-600">評論</label>
        <Textarea
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          placeholder="分享您的觀後感..."
          rows={3}
          className="mt-1"
        />
      </div>

      {/* 備註 */}
      <div>
        <label className="text-sm font-medium text-gray-600">備註</label>
        <Textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="其他備註..."
          rows={2}
          className="mt-1"
        />
      </div>

      {/* 來源 */}
      <div>
        <label className="text-sm font-medium text-gray-600">來源</label>
        <Input
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="AniList, 手動新增..."
          className="mt-1"
        />
      </div>

      {/* 按鈕 */}
      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          儲存變更
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          取消
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return formContent;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>編輯作品</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    </div>
  );
}
