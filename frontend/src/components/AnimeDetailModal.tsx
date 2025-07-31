"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AniListMedia, anilistService } from "@/lib/anilist";
import { WorkCreate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import {
  X,
  Star,
  Calendar,
  Play,
  Plus,
  Globe,
  Clock,
  Users,
  Award,
  FileText,
  ExternalLink,
} from "lucide-react";

interface AnimeDetailModalProps {
  anime: AniListMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAnime: (workData: WorkCreate) => void;
}

export default function AnimeDetailModal({
  anime,
  isOpen,
  onClose,
  onSelectAnime,
}: AnimeDetailModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const { createWork } = useWorkStore();

  if (!isOpen || !anime) return null;

  const handleConfirmSelection = async () => {
    setIsAdding(true);
    setDuplicateMessage(null);

    try {
      const workData: WorkCreate = {
        title: anilistService.getBestChineseTitle(anime.title, anime.synonyms),
        type: anilistService.convertTypeToWorkType(anime.type),
        status: anilistService.convertStatus(anime.status),
        year: anilistService.getYear(anime.startDate),
        rating: anilistService.convertRating(anime.averageScore),
        review: anilistService.cleanDescription(anime.description),
        note: `來自 AniList (ID: ${anime.id})
格式: ${anilistService.convertFormat(anime.format)}
${
  anime.season && anime.seasonYear
    ? `播出時間: ${anilistService.convertSeason(anime.season)} ${
        anime.seasonYear
      }年`
    : ""
}
其他標題: ${anilistService
          .getAllTitles(anime.title, anime.synonyms)
          .slice(1)
          .join(", ")}`,
        source: "AniList",
        episodes: anime.episodes
          ? Array.from({ length: anime.episodes }, (_, i) => ({
              id: `ep-${anime.id}-${i + 1}`,
              number: i + 1,
              type: "episode" as const,
              season: 1,
              watched: false,
            }))
          : [],
      };

      // 新增作品（store 會自動檢查重複）
      const newWork = createWork(workData);

      // 只有在成功新增後才關閉彈窗
      onClose();

      // 顯示成功訊息（可選）
      console.log("成功新增作品:", newWork.title);
    } catch (error) {
      console.error("新增作品失敗:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "新增作品時發生錯誤，請稍後再試。";
      setDuplicateMessage(errorMessage);
      // 不關閉彈窗，讓用戶看到錯誤訊息
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FINISHED":
        return "bg-green-100 text-green-800";
      case "RELEASING":
        return "bg-blue-100 text-blue-800";
      case "NOT_YET_RELEASED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
      case "HIATUS":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "FINISHED":
        return "已完結";
      case "RELEASING":
        return "連載中";
      case "NOT_YET_RELEASED":
        return "未播出";
      case "CANCELLED":
        return "已取消";
      case "HIATUS":
        return "暫停";
      default:
        return status;
    }
  };

  const getFormatText = (format: string) => {
    return anilistService.convertFormat(format);
  };

  const getSeasonText = (season: string | null, year: number | null) => {
    if (!season || !year) return "";
    const seasonText = anilistService.convertSeason(season);
    return `${year}年${seasonText}`;
  };

  const formatDate = (date: {
    year: number | null;
    month: number | null;
    day: number | null;
  }) => {
    if (!date.year) return "未知";
    const parts: (string | number)[] = [date.year];
    if (date.month !== null) parts.push(date.month.toString().padStart(2, "0"));
    if (date.day !== null) parts.push(date.day.toString().padStart(2, "0"));
    return parts.join("-");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              動畫詳情
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：封面圖片 */}
            <div className="lg:col-span-1">
              {anime.coverImage?.large && (
                <div className="sticky top-0">
                  <img
                    src={anime.coverImage.large}
                    alt={anime.title.romaji}
                    className="w-full rounded-lg shadow-lg"
                  />
                  {anime.bannerImage && (
                    <img
                      src={anime.bannerImage}
                      alt="Banner"
                      className="w-full h-32 object-cover rounded-lg mt-4"
                    />
                  )}
                </div>
              )}
            </div>

            {/* 右側：詳細資訊 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 標題區域 */}
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {anilistService.getBestChineseTitle(
                    anime.title,
                    anime.synonyms
                  )}
                </h1>
                {anime.title.romaji && (
                  <p className="text-lg text-gray-600 mb-1">
                    {anime.title.romaji}
                  </p>
                )}
                {anime.title.english &&
                  anime.title.english !== anime.title.romaji && (
                    <p className="text-lg text-gray-600 mb-1">
                      {anime.title.english}
                    </p>
                  )}
                {anime.title.native && (
                  <p className="text-lg text-gray-600">{anime.title.native}</p>
                )}
              </div>

              {/* 基本資訊 */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(anime.status)}>
                  {getStatusText(anime.status)}
                </Badge>
                {anime.format && (
                  <Badge variant="outline">{getFormatText(anime.format)}</Badge>
                )}
                {anime.episodes && (
                  <Badge variant="outline">
                    <Play className="w-3 h-3 mr-1" />
                    {anime.episodes} 集
                  </Badge>
                )}
                {anime.duration && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {anime.duration} 分鐘
                  </Badge>
                )}
                {anime.season && anime.seasonYear && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {getSeasonText(anime.season, anime.seasonYear)}
                  </Badge>
                )}
              </div>

              {/* 評分 */}
              {anime.averageScore && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-lg font-semibold">
                    {(anime.averageScore / 10).toFixed(1)}/10
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({anime.averageScore} 分)
                  </span>
                </div>
              )}

              {/* 播出時間 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    播出時間
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">開始：</span>
                      {formatDate(anime.startDate)}
                    </div>
                    {anime.endDate && (
                      <div>
                        <span className="text-gray-600">結束：</span>
                        {formatDate(anime.endDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 類型 */}
                {anime.genres && anime.genres.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      類型
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {anime.genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="text-xs"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 描述 */}
              {anime.description && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    簡介
                  </h3>
                  <div
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: anime.description.replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              )}

              {/* 其他標題 */}
              {anime.synonyms && anime.synonyms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">其他標題</h3>
                  <div className="flex flex-wrap gap-1">
                    {anime.synonyms.slice(0, 10).map((synonym, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {synonym}
                      </Badge>
                    ))}
                    {anime.synonyms.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{anime.synonyms.length - 10} 更多
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* 來源國家 */}
              {anime.countryOfOrigin && (
                <div>
                  <h3 className="font-semibold mb-2">來源國家</h3>
                  <Badge variant="outline">{anime.countryOfOrigin}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* 底部操作按鈕 */}
        <div className="border-t p-4 bg-gray-50">
          {duplicateMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {duplicateMessage}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>
                將新增作品：{" "}
                <span className="font-medium">
                  {anilistService.getBestChineseTitle(
                    anime.title,
                    anime.synonyms
                  )}
                </span>
              </p>
              {anime.episodes && (
                <p className="text-xs text-gray-500">
                  自動創建 {anime.episodes} 集
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleConfirmSelection} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    新增中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    新增作品
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
