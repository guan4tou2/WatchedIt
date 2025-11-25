"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AniListMedia, anilistService } from "@/lib/anilist";
import { WorkCreate } from "@/types";
import { useWorkStore } from "@/store/useWorkStore";
import { Search, X, Star, Calendar, Play, Plus, Loader2, ExternalLink, Info } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import AnimeDetailModal from "./AnimeDetailModal";

interface AniListSearchProps {
  onSelectAnime: (workData: WorkCreate) => void;
  onClose: () => void;
  onWorkAdded?: () => void; // 新增作品成功時的回調
  isOpen: boolean;
}

export default function AniListSearch({
  onSelectAnime,
  onClose,
  onWorkAdded,
  isOpen,
}: AniListSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AniListMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AniListMedia | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnimeForDetail, setSelectedAnimeForDetail] =
    useState<AniListMedia | null>(null);
  const { createWork } = useWorkStore();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const searchAnime = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await anilistService.searchAnime(term, 1, 10);
      setSearchResults(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "搜尋失敗";

      // 檢查是否是後端服務不可用的錯誤
      if (
        errorMessage.includes("API 端點未配置") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          "後端服務不可用。請設定 NEXT_PUBLIC_API_URL 環境變數或部署後端服務。目前僅支援本地儲存模式。"
        );
      } else {
        setError(errorMessage);
      }

      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAnime(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, searchAnime]);

  const handleAnimeSelect = (anime: AniListMedia) => {
    setSelectedAnime(anime);
  };

  const handleViewDetail = (anime: AniListMedia) => {
    setSelectedAnimeForDetail(anime);
    setDetailModalOpen(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedAnime) return;

    const workData: WorkCreate = {
      title: anilistService.getBestChineseTitle(
        selectedAnime.title,
        selectedAnime.synonyms
      ),
      type: anilistService.convertTypeToWorkType(selectedAnime.type),
      status: anilistService.convertStatus(selectedAnime.status),
      year: anilistService.getYear(selectedAnime.startDate),
      rating: anilistService.convertRating(selectedAnime.averageScore),
      review: anilistService.cleanDescription(selectedAnime.description),
      note: `來自 AniList (ID: ${selectedAnime.id})
格式: ${anilistService.convertFormat(selectedAnime.format)}
${selectedAnime.season && selectedAnime.seasonYear
          ? `播出時間: ${anilistService.convertSeason(selectedAnime.season)} ${selectedAnime.seasonYear
          }年`
          : ""
        }
其他標題: ${anilistService
          .getAllTitles(selectedAnime.title, selectedAnime.synonyms)
          .slice(1)
          .join(", ")}`,
      source: "AniList",
      episodes: selectedAnime.episodes
        ? Array.from({ length: selectedAnime.episodes }, (_, i) => ({
          id: `ep-${selectedAnime.id}-${i + 1}`,
          number: i + 1,
          type: "episode" as const,
          season: 1,
          watched: false,
        }))
        : [],
    };

    try {
      // 新增作品（store 會自動檢查重複）
      const newWork = await createWork(workData);
      console.log("新增作品成功:", newWork);

      // 通知主頁面作品新增成功
      if (onWorkAdded) {
        onWorkAdded();
      }

      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "新增作品失敗";
      console.error("新增作品失敗:", error);
      alert(errorMessage);
      // 不關閉視窗，讓用戶看到錯誤訊息
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />從 AniList 搜尋動畫
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋動畫名稱..."
              className="pr-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="error-container px-4 py-3 rounded mb-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">搜尋遇到問題</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              {error.includes("後端服務不可用") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://anilist.co', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  在 AniList 網站搜尋
                </Button>
              )}
            </div>
          )}

          {searchResults.length === 0 && !isLoading && searchTerm && !error && (
            <div className="text-center py-8 space-y-4 animate-fade-in-up">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">沒有找到相關動畫</p>
                <p className="text-sm">試試以下方法：</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-left max-w-md mx-auto space-y-2">
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>使用日文原名（例如：ワンピース、鬼滅の刃）</span>
                </p>
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>使用英文名稱（例如：One Piece、Demon Slayer）</span>
                </p>
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>檢查拼寫是否正確</span>
                </p>
                <p className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>嘗試使用較短的關鍵字</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('https://anilist.co', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                在 AniList 網站搜尋
              </Button>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 space-y-3 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1">搜尋 AniList 動畫</p>
                <p className="text-sm text-muted-foreground">輸入動畫名稱開始搜尋</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 max-w-sm mx-auto">
                <p className="text-xs text-muted-foreground">
                  💡 提示：支援中文、日文、英文搜尋
                </p>
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <Skeleton className="w-16 h-24 flex-shrink-0 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-1">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {!isLoading && searchResults.map((anime) => (
              <Card
                key={anime.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedAnime?.id === anime.id
                    ? "ring-2 ring-blue-500 selected-bg"
                    : ""
                  }`}
                onClick={() => handleViewDetail(anime)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {anime.coverImage?.medium && (
                      <img
                        src={anime.coverImage.medium}
                        alt={anime.title.romaji}
                        className="w-16 h-24 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3 className="font-semibold text-lg truncate mb-1">
                        {anilistService.getBestChineseTitle(
                          anime.title,
                          anime.synonyms
                        )}
                      </h3>
                      {anime.title.romaji && (
                        <p className="text-sm description-text truncate mb-2">
                          {anime.title.romaji}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1 mt-2">
                        <Badge className={getStatusColor(anime.status)}>
                          {getStatusText(anime.status)}
                        </Badge>
                        {anime.format && (
                          <Badge variant="outline" className="text-xs">
                            {getFormatText(anime.format)}
                          </Badge>
                        )}
                        {anime.episodes && (
                          <Badge variant="outline" className="text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            {anime.episodes} 集
                          </Badge>
                        )}
                        {anime.season && anime.seasonYear && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {getSeasonText(anime.season, anime.seasonYear)}
                          </Badge>
                        )}
                      </div>

                      {anime.averageScore && (
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 star-icon mr-1 flex-shrink-0" />
                          <span className="text-sm description-text truncate">
                            {(anime.averageScore / 10).toFixed(1)}/10
                          </span>
                        </div>
                      )}

                      {anime.genres && anime.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {anime.genres.slice(0, 3).map((genre) => (
                            <Badge
                              key={genre}
                              variant="secondary"
                              className="text-xs"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnimeSelect(anime);
                      }}
                      className="flex-1"
                    >
                      選擇
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        {selectedAnime && (
          <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="description-container">
                  已選擇:{" "}
                  <span className="font-medium">
                    {anilistService.getBestChineseTitle(
                      selectedAnime.title,
                      selectedAnime.synonyms
                    )}
                  </span>
                </p>
                {selectedAnime.episodes && (
                  <p className="text-xs-secondary">
                    將自動創建 {selectedAnime.episodes} 集
                  </p>
                )}
              </div>
              <Button onClick={handleConfirmSelection}>
                <Plus className="w-4 h-4 mr-2" />
                新增作品
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 動畫詳情彈窗 */}
      <AnimeDetailModal
        anime={selectedAnimeForDetail}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAnimeForDetail(null);
        }}
        onSelectAnime={onSelectAnime}
      />
    </div>
  );
}
