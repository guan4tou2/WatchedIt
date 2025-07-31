"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Work, WorkCreate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import { ArrowLeft, Save, Star, Plus } from "lucide-react";

export default function NewWorkPage() {
  const router = useRouter();
  const { createWork } = useWorkStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "動畫" as Work["type"],
    status: "進行中" as Work["status"],
    year: "",
    rating: "",
    review: "",
    note: "",
    source: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newWork: WorkCreate = {
        title: formData.title,
        type: formData.type,
        status: formData.status,
        year: formData.year ? parseInt(formData.year) : undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        review: formData.review || undefined,
        note: formData.note || undefined,
        source: formData.source || undefined,
        episodes: [],
      };

      const createdWork = createWork(newWork);

      // 導航到新創建的作品詳情頁面
      router.push(`/works/${createdWork.id}`);
    } catch (error) {
      console.error("創建作品失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData({
      ...formData,
      rating: formData.rating === rating.toString() ? "" : rating.toString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "進行中":
        return "bg-blue-100 text-blue-800";
      case "已完成":
        return "bg-green-100 text-green-800";
      case "暫停":
        return "bg-yellow-100 text-yellow-800";
      case "放棄":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "動畫":
        return "bg-purple-100 text-purple-800";
      case "電影":
        return "bg-red-100 text-red-800";
      case "電視劇":
        return "bg-blue-100 text-blue-800";
      case "小說":
        return "bg-green-100 text-green-800";
      case "漫畫":
        return "bg-orange-100 text-orange-800";
      case "遊戲":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* 導航欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">新增作品</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要表單 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>作品資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      標題 *
                    </label>
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
                    <label className="text-sm font-medium text-gray-600">
                      類型 *
                    </label>
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
                    <label className="text-sm font-medium text-gray-600">
                      狀態 *
                    </label>
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
                    <label className="text-sm font-medium text-gray-600">
                      年份
                    </label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="2023"
                      min="1900"
                      max="2030"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 評分 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    評分
                  </label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className={`p-2 rounded-md transition-colors ${
                          parseInt(formData.rating || "0") >= rating
                            ? "text-yellow-500 bg-yellow-50"
                            : "text-gray-400 hover:text-yellow-400"
                        }`}
                      >
                        <Star
                          className="w-5 h-5"
                          fill={
                            parseInt(formData.rating || "0") >= rating
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
                  <label className="text-sm font-medium text-gray-600">
                    評論
                  </label>
                  <Textarea
                    value={formData.review}
                    onChange={(e) =>
                      setFormData({ ...formData, review: e.target.value })
                    }
                    placeholder="分享您的觀後感..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* 備註 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    備註
                  </label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="其他備註..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* 來源 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    來源
                  </label>
                  <Input
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    placeholder="AniList, 手動新增..."
                    className="mt-1"
                  />
                </div>

                {/* 按鈕 */}
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "創建中..." : "創建作品"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 側邊欄預覽 */}
        <div className="space-y-6">
          {/* 預覽卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>預覽</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.title && (
                <div>
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getTypeColor(formData.type)}>
                      {formData.type}
                    </Badge>
                    <Badge className={getStatusColor(formData.status)}>
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              )}

              {formData.year && (
                <div className="text-sm text-gray-600">
                  年份: {formData.year}
                </div>
              )}

              {formData.rating && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  評分: {formData.rating}/5
                </div>
              )}

              {formData.review && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    評論:
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    {formData.review}
                  </div>
                </div>
              )}

              {formData.note && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    備註:
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    {formData.note}
                  </div>
                </div>
              )}

              {formData.source && (
                <div className="text-sm text-gray-600">
                  來源: {formData.source}
                </div>
              )}

              {!formData.title && (
                <div className="text-center text-gray-500 py-8">
                  填寫資訊後將在此顯示預覽
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提示資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">提示</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <div>• 標題和類型為必填項目</div>
              <div>• 創建後可以立即添加集數</div>
              <div>• 可以稍後在作品詳情頁面編輯</div>
              <div>• 支援匯入/匯出資料</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
