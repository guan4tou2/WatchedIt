"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Work, Episode, WorkUpdate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import EpisodeManager from "@/components/EpisodeManager";
import WorkEditForm from "@/components/WorkEditForm";
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

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getWork, updateWork, deleteWork, loading } = useWorkStore();
  const [work, setWork] = useState<Work | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (params?.id) {
      const workData = getWork(params.id as string);
      setWork(workData);
    }
  }, [params?.id, getWork]);

  const handleEpisodesChange = (episodes: Episode[]) => {
    if (!work) return;

    const updatedWork = {
      ...work,
      episodes,
      date_updated: new Date().toISOString(),
    };

    setWork(updatedWork);
    updateWork(work.id, { episodes });
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
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">作品不存在</div>
      </div>
    );
  }

  const episodes = work.episodes || [];
  const watchedCount = episodes.filter((ep) => ep.watched).length;
  const totalEpisodes = episodes.length;
  const completionRate =
    totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

  return (
    <div className="container mx-auto p-6">
      {/* 導航欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">{work.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            編輯作品
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "完成編輯" : "編輯集數"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            刪除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要資訊 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    類型
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary">{work.type}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    狀態
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        work.status === "已完成"
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
                {work.year && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      年份
                    </label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                      {work.year}
                    </div>
                  </div>
                )}
                {work.rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      評分
                    </label>
                    <div className="mt-1 flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {work.rating}/5
                    </div>
                  </div>
                )}
              </div>

              {work.review && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    短評
                  </label>
                  <p className="mt-1 text-gray-800">{work.review}</p>
                </div>
              )}

              {work.note && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    備註
                  </label>
                  <p className="mt-1 text-gray-800">{work.note}</p>
                </div>
              )}

              {work.source && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    來源
                  </label>
                  <p className="mt-1 text-gray-800">{work.source}</p>
                </div>
              )}

              {work.tags && work.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    標籤
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {work.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 集數管理 */}
          <EpisodeManager
            episodes={episodes}
            onEpisodesChange={handleEpisodesChange}
            type={work.type}
            disabled={!isEditing}
          />
        </div>

        {/* 側邊欄 */}
        <div className="space-y-6">
          {/* 集數摘要 */}
          <Card>
            <CardHeader>
              <CardTitle>集數摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {totalEpisodes}
                </div>
                <div className="text-sm text-gray-600">已記錄集數</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{totalEpisodes}</div>
                  <div className="text-gray-600">總集數</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {episodes.length > 0
                      ? Math.max(...episodes.map((ep) => ep.season), 1)
                      : 1}
                  </div>
                  <div className="text-gray-600">季數</div>
                </div>
              </div>

              {/* 集數類型統計 */}
              {episodes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">集數類型</div>
                  <div className="space-y-1">
                    {Object.entries(
                      episodes.reduce((acc, ep) => {
                        acc[ep.type] = (acc[ep.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="capitalize">{type}</span>
                        <span>{count}</span>
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
                <span className="text-sm text-gray-600">新增時間</span>
                <span className="text-sm">
                  {new Date(work.date_added).toLocaleDateString("zh-TW")}
                </span>
              </div>
              {work.date_updated && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">更新時間</span>
                  <span className="text-sm">
                    {new Date(work.date_updated).toLocaleDateString("zh-TW")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 編輯作品表單 */}
      {work && (
        <WorkEditForm
          work={work}
          onSave={handleWorkUpdate}
          onCancel={() => setShowEditForm(false)}
          isOpen={showEditForm}
        />
      )}
    </div>
  );
}
