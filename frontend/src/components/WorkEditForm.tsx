"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Work, WorkUpdate, Tag } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import TagSelector from "@/components/TagSelector";
import { X, Save, Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface WorkEditFormProps {
  work: Work;
  onSave: (updatedWork: WorkUpdate) => void;
  onCancel: () => void;
  isOpen: boolean;
  inline?: boolean;
  isSaving?: boolean;
}

const WORK_TYPES = ["動畫", "電影", "電視劇", "小說", "漫畫", "遊戲"];
const WORK_STATUSES: Work["status"][] = [
  "進行中",
  "已完結",
  "暫停",
  "放棄",
  "未播出",
  "已取消",
];

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

export default function WorkEditForm({
  work,
  onSave,
  onCancel,
  isOpen,
  inline = false,
  isSaving = false,
}: WorkEditFormProps) {
  const { tags } = useWorkStore();
  const t = useTranslations("WorkEditForm");
  const workStatusT = useTranslations("Work.status");
  const workTypeT = useTranslations("Work.type");
  const [formData, setFormData] = useState({
    title: work.title,
    type: work.type,
    status: work.status,
    year: work.year ?? "",
    rating: work.rating ?? "",
    review: work.review || "",
    note: work.note || "",
    source: work.source || "",
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>(work.tags || []);

  useEffect(() => {
    setFormData({
      title: work.title,
      type: work.type,
      status: work.status,
      year: work.year ?? "",
      rating: work.rating ?? "",
      review: work.review || "",
      note: work.note || "",
      source: work.source || "",
    });
    setSelectedTags(work.tags || []);
  }, [work]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const updatedWork: WorkUpdate = {
      title: formData.title,
      type: formData.type,
      status: formData.status,
      year: formData.year ? parseInt(formData.year.toString()) : undefined,
      rating: formData.rating
        ? parseFloat(formData.rating.toString())
        : undefined,
      review: formData.review || undefined,
      note: formData.note || undefined,
      source: formData.source || undefined,
      tags: selectedTags,
    };

    onSave(updatedWork);
  };

  const handleRatingClick = (rating: number) => {
    if (isSaving) return;

    setFormData({
      ...formData,
      rating: formData.rating === rating.toString() ? "" : rating.toString(),
    });
  };

  const getLocalizedTypeLabel = (type: string) =>
    WORK_TYPE_KEY_MAP[type] ? workTypeT(WORK_TYPE_KEY_MAP[type]) : type;

  const getLocalizedStatusLabel = (status: Work["status"]) =>
    WORK_STATUS_KEY_MAP[status]
      ? workStatusT(WORK_STATUS_KEY_MAP[status])
      : status;

  if (!isOpen) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-work-title" className="form-label">
            {t("labels.title")}
          </label>
          <Input
            id="edit-work-title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder={t("placeholders.title")}
            required
            disabled={isSaving}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="edit-work-type" className="form-label">
            {t("labels.type")}
          </label>
          <select
            id="edit-work-type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as Work["type"],
              })
            }
            className="w-full mt-1 p-2 border rounded-md form-select"
            required
            disabled={isSaving}
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
          <label htmlFor="edit-work-status" className="form-label">
            {t("labels.status")}
          </label>
          <select
            id="edit-work-status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as Work["status"],
              })
            }
            className="w-full mt-1 p-2 border rounded-md form-select"
            required
            disabled={isSaving}
          >
            {WORK_STATUSES.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getLocalizedStatusLabel(statusOption)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-work-year" className="form-label">
            {t("labels.year")}
          </label>
          <Input
            id="edit-work-year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            placeholder={t("placeholders.year")}
            min="1900"
            max="2030"
            disabled={isSaving}
            className="mt-1"
          />
        </div>
      </div>

      {/* 標籤選擇 */}
      <TagSelector
        availableTags={tags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        disabled={isSaving}
      />

      {/* 評分 */}
      <div>
        <label className="form-label">{t("labels.rating")}</label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <button
              key={rating}
              type="button"
              aria-label={t("ratingOption", { value: rating })}
              onClick={() => handleRatingClick(rating)}
              disabled={isSaving}
              className={`p-2 rounded-md transition-colors ${
                parseFloat(String(formData.rating || "0")) >= rating
                  ? "star-icon bg-yellow-50 dark:bg-yellow-900/20"
                  : "star-icon-unselected"
              }`}
            >
              <Star
                className="w-5 h-5"
                fill={
                  parseFloat(String(formData.rating || "0")) >= rating
                    ? "currentColor"
                    : "none"
                }
              />
            </button>
          ))}
          {formData.rating && (
            <span className="text-sm description-text ml-2">
              {t("ratingValue", { value: Number(formData.rating) })}
            </span>
          )}
        </div>
        <div className="mt-3 max-w-40">
          <label htmlFor="edit-work-rating" className="sr-only">
            {t("ratingInputLabel")}
          </label>
          <Input
            id="edit-work-rating"
            type="number"
            inputMode="decimal"
            min="0"
            max="10"
            step="0.5"
            value={formData.rating}
            onChange={(e) =>
              setFormData({ ...formData, rating: e.target.value })
            }
            placeholder="0-10"
            disabled={isSaving}
          />
          <p className="mt-1 text-xs note-text">{t("ratingInputHelp")}</p>
        </div>
      </div>

      {/* 評論 */}
      <div>
        <label htmlFor="edit-work-review" className="form-label">
          {t("labels.review")}
        </label>
        <textarea
          id="edit-work-review"
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          placeholder={t("placeholders.review")}
          rows={3}
          disabled={isSaving}
          className="w-full mt-1 p-2 border rounded-md resize-none form-input"
        />
      </div>

      {/* 備註 */}
      <div>
        <label htmlFor="edit-work-note" className="form-label">
          {t("labels.note")}
        </label>
        <textarea
          id="edit-work-note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder={t("placeholders.note")}
          rows={2}
          disabled={isSaving}
          className="w-full mt-1 p-2 border rounded-md resize-none form-input"
        />
      </div>

      {/* 來源 */}
      <div>
        <label htmlFor="edit-work-source" className="form-label">
          {t("labels.source")}
        </label>
        <Input
          id="edit-work-source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder={t("placeholders.source")}
          disabled={isSaving}
          className="mt-1"
        />
      </div>

      {/* 按鈕 */}
      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? t("buttons.saving") : t("buttons.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          {t("buttons.cancel")}
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cardTitle")}</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
