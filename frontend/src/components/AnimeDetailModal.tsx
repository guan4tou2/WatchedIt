"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AniListMedia, anilistService } from "@/lib/anilist";
import { WorkCreate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import { useToast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";
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

const STATUS_TRANSLATION_KEYS: Record<string, string> = {
  FINISHED: "finished",
  RELEASING: "releasing",
  NOT_YET_RELEASED: "notYetReleased",
  CANCELLED: "cancelled",
  HIATUS: "hiatus",
};

const FORMAT_TRANSLATION_KEYS: Record<string, string> = {
  TV: "tv",
  TV_SHORT: "tvShort",
  MOVIE: "movie",
  SPECIAL: "special",
  OVA: "ova",
  ONA: "ona",
  MUSIC: "music",
};

const SEASON_TRANSLATION_KEYS: Record<string, string> = {
  WINTER: "winter",
  SPRING: "spring",
  SUMMER: "summer",
  FALL: "fall",
};

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
  const { showToast } = useToast();
  const t = useTranslations("AnimeDetailModal");

  if (!isOpen || !anime) return null;

  const handleClose = () => {
    if (!isAdding) {
      onClose();
    }
  };

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
${anime.season && anime.seasonYear
            ? `播出時間: ${anilistService.convertSeason(anime.season)} ${anime.seasonYear
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
      await createWork(workData);

      // 顯示成功提示
      showToast(t("messages.addSuccess"), "success");

      // 只有在成功新增後才關閉彈窗
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("messages.genericError");
      setDuplicateMessage(errorMessage);
      showToast(t("messages.addError"), "error");
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
    const translationKey = STATUS_TRANSLATION_KEYS[status];
    return translationKey ? t(`status.${translationKey}`) : status;
  };

  const getFormatText = (format: string) => {
    const translationKey = FORMAT_TRANSLATION_KEYS[format];
    return translationKey ? t(`format.${translationKey}`) : format;
  };

  const getSeasonText = (season: string | null, year: number | null) => {
    if (!season || !year) return "";
    const translationKey = SEASON_TRANSLATION_KEYS[season];
    const seasonText = translationKey ? t(`season.${translationKey}`) : season;
    return t("seasonYear", { year, season: seasonText });
  };

  const formatDate = (date: {
    year: number | null;
    month: number | null;
    day: number | null;
  }) => {
    if (!date.year) return t("unknown");
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
              {t("title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label={t("buttons.close")}
              disabled={isAdding}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側：封面圖片 */}
            <div className="lg:col-span-1">
              {anime.coverImage?.large && (
                <div className="sticky top-0 space-y-4">
                  <div className="relative w-full aspect-[2/3]">
                    <Image
                      src={anime.coverImage.large}
                      alt={anime.title.romaji || "Anime Cover"}
                      fill
                      className="object-cover rounded-lg shadow-lg"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      priority
                    />
                  </div>
                  {anime.bannerImage && (
                    <div className="relative w-full h-32">
                      <Image
                        src={anime.bannerImage}
                        alt="Banner"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
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
                  <p className="text-lg description-text mb-1">
                    {anime.title.romaji}
                  </p>
                )}
                {anime.title.english &&
                  anime.title.english !== anime.title.romaji && (
                    <p className="text-lg description-text mb-1">
                      {anime.title.english}
                    </p>
                  )}
                {anime.title.native && (
                  <p className="text-lg description-text">
                    {anime.title.native}
                  </p>
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
                    {t("units.episodes", { count: anime.episodes })}
                  </Badge>
                )}
                {anime.duration && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {t("units.minutes", { count: anime.duration })}
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
                  <Star className="w-5 h-5 star-icon mr-2" />
                  <span className="text-lg font-semibold">
                    {(anime.averageScore / 10).toFixed(1)}/10
                  </span>
                  <span className="text-sm note-text ml-2">
                    ({t("units.score", { score: anime.averageScore })})
                  </span>
                </div>
              )}

              {/* 播出時間 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {t("sections.airDates")}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="description-text">
                        {t("labels.start")}
                      </span>
                      {formatDate(anime.startDate)}
                    </div>
                    {anime.endDate && (
                      <div>
                        <span className="description-text">
                          {t("labels.end")}
                        </span>
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
                      {t("sections.genres")}
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
                    {t("sections.description")}
                  </h3>
                  <div
                    className="paragraph-text"
                    dangerouslySetInnerHTML={{
                      __html: anime.description.replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              )}

              {/* 其他標題 */}
              {anime.synonyms && anime.synonyms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.aliases")}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {anime.synonyms.slice(0, 10).map((synonym, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {synonym}
                      </Badge>
                    ))}
                    {anime.synonyms.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        {t("moreAliases", {
                          count: anime.synonyms.length - 10,
                        })}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* 來源國家 */}
              {anime.countryOfOrigin && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.country")}
                  </h3>
                  <Badge variant="outline">{anime.countryOfOrigin}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* 底部操作按鈕 */}
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
          {duplicateMessage && (
            <div className="error-container mb-4 p-3 rounded" role="alert">
              {duplicateMessage}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="description-container">
              <p>
                {t("labels.addingWork")}{" "}
                <span className="font-medium">
                  {anilistService.getBestChineseTitle(
                    anime.title,
                    anime.synonyms
                  )}
                </span>
              </p>
              {anime.episodes && (
                <p className="text-xs-secondary">
                  {t("labels.autoCreateEpisodes", { count: anime.episodes })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isAdding}
              >
                {t("buttons.cancel")}
              </Button>
              <Button onClick={handleConfirmSelection} disabled={isAdding}>
                {isAdding ? (
                  <>
                    <div
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    {t("buttons.adding")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("buttons.addWork")}
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
