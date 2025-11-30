"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Work, WorkCreate, Tag } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import TagSelector from "@/components/TagSelector";
import { ArrowLeft, Save, Star, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";

const WORK_TYPES: Work["type"][] = ["動畫", "電影", "電視劇", "小說", "漫畫", "遊戲"];
const WORK_STATUSES: Work["status"][] = ["進行中", "已完結", "暫停", "放棄", "未播出", "已取消"];

const WORK_TYPE_KEY_MAP: Record<string, string> = {
  動畫: "anime",
  電影: "movie",
  電視劇: "tv",
  小說: "novel",
  漫畫: "manga",
  遊戲: "game",
};

const WORK_STATUS_KEY_MAP: Record<Work["status"], string> = {
  進行中: "ongoing",
  已完結: "completed",
  暫停: "paused",
  放棄: "dropped",
  未播出: "notStarted",
  已取消: "cancelled",
};

export default function NewWorkPage() {
  const router = useRouter();
  const { createWork, tags } = useWorkStore();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("NewWork");
  const commonT = useTranslations("Common");
  const workStatusT = useTranslations("Work.status");
  const workTypeT = useTranslations("Work.type");

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

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Toast 通知
  const { showToast, ToastContainer } = useToast();
  const getLocalizedTypeLabel = (type: Work["type"]) =>
    WORK_TYPE_KEY_MAP[type] ? workTypeT(WORK_TYPE_KEY_MAP[type]) : type;
  const getLocalizedStatusLabel = (status: Work["status"]) =>
    WORK_STATUS_KEY_MAP[status]
      ? workStatusT(WORK_STATUS_KEY_MAP[status])
      : status;

  const handleSubmit = async (e: React.FormEvent) => {
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
        tags: selectedTags,
        episodes: [],
      };

      const createdWork = await createWork(newWork);

      showToast(t("messages.createSuccess", { defaultMessage: "作品新增成功！" }), "success");

      // 導航回主頁面
      router.push("/");
    } catch (error) {
      console.error("創建作品失敗:", error);
      showToast(t("messages.createError", { defaultMessage: "創建作品失敗" }), "error");
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

  return (
    <div className="container mx-auto p-6">
      {/* 導航欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {commonT("back", { defaultMessage: "返回" })}
          </Button>
          <h1 className="text-2xl font-bold">
            {t("title", { defaultMessage: "新增作品" })}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要表單 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("form.cardTitle", { defaultMessage: "作品資訊" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本資訊 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="work-title"
                      className="text-sm font-medium form-label-secondary"
                    >
                      {t("form.labels.title", { defaultMessage: "標題" })} *
                    </label>
                    <Input
                      id="work-title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder={t("form.placeholders.title", { defaultMessage: "作品標題" })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="work-type"
                      className="text-sm font-medium form-label-secondary"
                    >
                      {t("form.labels.type", { defaultMessage: "類型" })} *
                    </label>
                    <select
                      id="work-type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as Work["type"],
                        })
                      }
                      className="w-full mt-1 p-2 border rounded-md dark:text-foreground/95 dark:bg-background/95"
                      required
                    >
                      {WORK_TYPES.map((typeOption) => (
                        <option key={typeOption} value={typeOption}>
                          {getLocalizedTypeLabel(typeOption)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="work-status"
                      className="text-sm font-medium form-label-secondary"
                    >
                      {t("form.labels.status", { defaultMessage: "狀態" })} *
                    </label>
                    <select
                      id="work-status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Work["status"],
                        })
                      }
                      className="w-full mt-1 p-2 border rounded-md dark:text-foreground/95 dark:bg-background/95"
                      required
                    >
                      {WORK_STATUSES.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {getLocalizedStatusLabel(statusOption)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="work-year"
                      className="text-sm font-medium form-label-secondary"
                    >
                      {t("form.labels.year", { defaultMessage: "年份" })}
                    </label>
                    <Input
                      id="work-year"
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder={t("form.placeholders.year", { defaultMessage: "2023" })}
                      min="1900"
                      max="2030"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 標籤選擇 */}
                <TagSelector
                  availableTags={tags}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />

                {/* 評分 */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("form.labels.rating", { defaultMessage: "評分" })}
                  </label>
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className={`p-2 rounded-md transition-colors ${parseInt(formData.rating || "0") >= rating
                          ? "text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                          : "star-icon-unselected"
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
                      <span className="text-sm status-text ml-2">
                        {t("form.ratingValue", {
                          value: formData.rating,
                          defaultMessage: "{value}/10"
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* 評論 */}
                <div>
                  <label className="text-sm font-medium form-label-secondary">
                    {t("form.labels.review", { defaultMessage: "評論" })}
                  </label>
                  <Textarea
                    value={formData.review}
                    onChange={(e) =>
                      setFormData({ ...formData, review: e.target.value })
                    }
                    placeholder={t(
                      "form.placeholders.review",
                      { defaultMessage: "分享您的觀後感..." }
                    )}
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* 備註 */}
                <div>
                  <label className="text-sm font-medium form-label-secondary">
                    {t("form.labels.note", { defaultMessage: "備註" })}
                  </label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder={t(
                      "form.placeholders.note",
                      { defaultMessage: "其他備註..." }
                    )}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                {/* 來源 */}
                <div>
                  <label className="text-sm font-medium form-label-secondary">
                    {t("form.labels.source", { defaultMessage: "來源" })}
                  </label>
                  <Input
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    placeholder={t(
                      "form.placeholders.source",
                      { defaultMessage: "AniList, 手動新增..." }
                    )}
                    className="mt-1"
                  />
                </div>

                {/* 按鈕 */}
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading
                      ? t("buttons.saving", { defaultMessage: "創建中..." })
                      : t("buttons.save", { defaultMessage: "創建作品" })}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    {commonT("cancel", { defaultMessage: "取消" })}
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
              <CardTitle>{t("preview.title", { defaultMessage: "預覽" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.title && (
                <div>
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getTypeColor(formData.type)}>
                      {getLocalizedTypeLabel(formData.type)}
                    </Badge>
                    <Badge className={getStatusColor(formData.status)}>
                      {getLocalizedStatusLabel(formData.status)}
                    </Badge>
                  </div>
                </div>
              )}

              {formData.year && (
                <div className="text-sm status-text">
                  {t("preview.year", { defaultMessage: "年份" })}: {formData.year}
                </div>
              )}

              {selectedTags.length > 0 && (
                <div>
                  <div className="text-sm font-medium form-label-secondary mb-1">
                    {t("preview.tags", { defaultMessage: "標籤" })}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.rating && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {t("preview.rating", { defaultMessage: "評分" })}: {formData.rating}/10
                </div>
              )}

              {formData.review && (
                <div>
                  <div className="text-sm font-medium form-label-secondary mb-1">
                    {t("preview.review", { defaultMessage: "評論" })}:
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    {formData.review}
                  </div>
                </div>
              )}

              {formData.note && (
                <div>
                  <div className="text-sm font-medium form-label-secondary mb-1">
                    {t("preview.note", { defaultMessage: "備註" })}:
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    {formData.note}
                  </div>
                </div>
              )}

              {formData.source && (
                <div className="text-sm status-text">
                  {t("preview.source", { defaultMessage: "來源" })}: {formData.source}
                </div>
              )}

              {!formData.title && (
                <div className="text-center empty-state py-8">
                  {t("preview.empty", { defaultMessage: "填寫資訊後將在此顯示預覽" })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提示資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("tips.title", { defaultMessage: "提示" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs note-text space-y-2">
              <div>{t("tips.item1", { defaultMessage: "• 標題和類型為必填項目" })}</div>
              <div>{t("tips.item2", { defaultMessage: "• 可以為作品添加多個標籤" })}</div>
              <div>{t("tips.item3", { defaultMessage: "• 創建後可以立即添加集數" })}</div>
              <div>
                {t("tips.item4", { defaultMessage: "• 可以稍後在作品詳情頁面編輯" })}
              </div>
              <div>{t("tips.item5", { defaultMessage: "• 支援匯入/匯出資料" })}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  );
}
