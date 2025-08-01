"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Work, Episode, WorkUpdate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import EpisodeManager from "@/components/EpisodeManager";
import WorkEditForm from "@/components/WorkEditForm";
import { getFullPath } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Calendar,
  Tag,
  Save,
  X,
} from "lucide-react";

export default function WorkDetailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getWork, updateWork, deleteWork, loading } = useWorkStore();
  const [work, setWork] = useState<Work | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWork = async () => {
      const id = searchParams?.get('id');
      if (id) {
        setIsLoading(true);
        try {
          const workData = await getWork(id);
          setWork(workData);
        } catch (error) {
          console.error("載入作品失敗:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadWork();
  }, [searchParams, getWork]);

  const handleEpisodesChange = (episodes: Episode[]) => {
    if (!work) return;

    try {
      console.log("處理集數變更:", episodes);

      const updatedWork = {
        ...work,
        episodes,
        date_updated: new Date().toISOString(),
      };

      console.log("更新作品:", updatedWork);

      setWork(updatedWork);
      updateWork(work.id, { episodes });
    } catch (error) {
      console.error("處理集數變更失敗:", error);
    }
  };

  const handleWorkUpdate = (updatedData: WorkUpdate) => {
    if (!work) return;

    const updatedWork = {
      ...work,
      ...updatedData,
      date_updated: new Date().toISOString(),
    };

    setWork(updatedWork);
    updateWork(work.id, updatedData);
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (!work) return;

    if (confirm("確定要刪除這個作品嗎？")) {
      await deleteWork(work.id);
      router.push(getFullPath("/"));
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">載入中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              作品不存在
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(getFullPath("/"))}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const episodes = work.episodes || [];
  const watchedCount = episodes.filter((ep) => ep.watched).length;
  const totalEpisodes = episodes.length;
  const completionRate =
    totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* 導航欄 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">{work.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            刪除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 主要資訊 */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle>基本資訊</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditForm(!showEditForm)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {showEditForm ? "取消編輯" : "編輯作品"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">類型</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{work.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="form-label">狀態</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        work.status === "已完結"
                          ? "default"
                          : work.status === "進行中"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {work.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="form-label">年份</label>
                  <p className="mt-1 title-text">{work.year || "未知"}</p>
                </div>
                <div>
                  <label className="form-label">評分</label>
                  <p className="mt-1 title-text">
                    {work.rating ? `${work.rating}/5` : "未評分"}
                  </p>
                </div>
                <div>
                  <label className="form-label flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    新增時間
                  </label>
                  <p className="mt-1 title-text">
                    {new Date(work.date_added).toLocaleDateString("zh-TW")}
                  </p>
                </div>
                {work.date_updated && (
                  <div>
                    <label className="form-label">更新時間</label>
                    <p className="mt-1 title-text">
                      {new Date(work.date_updated).toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                )}
              </div>

              {work.review && (
                <div>
                  <label className="form-label">評論</label>
                  <p className="mt-1 description-text">{work.review}</p>
                </div>
              )}

              {work.note && (
                <div>
                  <label className="form-label">備註</label>
                  <p className="mt-1 description-text">{work.note}</p>
                </div>
              )}

              {work.source && (
                <div>
                  <label className="form-label">來源</label>
                  <p className="mt-1 description-text">{work.source}</p>
                </div>
              )}

              {work.tags && work.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    標籤
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 編輯作品表單 */}
              {showEditForm && work && (
                <div className="mt-6 p-4 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg">
                  <WorkEditForm
                    work={work}
                    onSave={handleWorkUpdate}
                    onCancel={() => setShowEditForm(false)}
                    isOpen={true}
                    inline={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 集數管理 */}
          <EpisodeManager
            episodes={episodes}
            onEpisodesChange={handleEpisodesChange}
            type={work.type}
            disabled={false}
            isEditing={isEditing}
            onToggleEditing={() => setIsEditing(!isEditing)}
          />
        </div>

        {/* 集數統計 */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>集數統計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold title-text">
                    {totalEpisodes}
                  </div>
                  <div className="description-text">總集數</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold title-text">{watchedCount}</div>
                  <div className="description-text">季數</div>
                </div>
              </div>

              {episodes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium title-text">集數類型</div>
                  <div className="space-y-1">
                    {Object.entries(
                      episodes.reduce((acc, ep) => {
                        acc[ep.type] = (acc[ep.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize subtitle-text">{type}</span>
                        <span className="title-text">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 時間資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>時間資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm description-text">新增時間</span>
                <span className="text-sm title-text">
                  {new Date(work.date_added).toLocaleDateString("zh-TW")}
                </span>
              </div>
              {work.date_updated && (
                <div className="flex justify-between">
                  <span className="text-sm description-text">更新時間</span>
                  <span className="text-sm title-text">
                    {new Date(work.date_updated).toLocaleDateString("zh-TW")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
