"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AniListMedia, anilistService } from "@/lib/anilist";
import { WorkCreate } from "@/types";
import { Search, X, Star, Calendar, Play, Plus, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface AniListSearchProps {
  onSelectAnime: (workData: WorkCreate) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function AniListSearch({
  onSelectAnime,
  onClose,
  isOpen,
}: AniListSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AniListMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AniListMedia | null>(null);

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
      setError(err instanceof Error ? err.message : "搜尋失敗");
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

  const handleConfirmSelection = () => {
    if (!selectedAnime) return;

    const workData: WorkCreate = {
      title: anilistService.getBestChineseTitle(selectedAnime.title),
      type: anilistService.convertTypeToWorkType(selectedAnime.type),
      status: anilistService.convertStatus(selectedAnime.status),
      year: anilistService.getYear(selectedAnime.startDate),
      rating: anilistService.convertRating(selectedAnime.averageScore),
      review: anilistService.cleanDescription(selectedAnime.description),
      note: `來自 AniList (ID: ${selectedAnime.id})
格式: ${anilistService.convertFormat(selectedAnime.format)}
${
  selectedAnime.season && selectedAnime.seasonYear
    ? `播出時間: ${anilistService.convertSeason(selectedAnime.season)} ${
        selectedAnime.seasonYear
      }年`
    : ""
}
其他標題: ${anilistService
        .getAllTitles(selectedAnime.title)
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

    onSelectAnime(workData);
    onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {searchResults.length === 0 && !isLoading && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              沒有找到相關動畫
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 text-gray-500">
              輸入動畫名稱開始搜尋
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((anime) => (
              <Card
                key={anime.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAnime?.id === anime.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => handleAnimeSelect(anime)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {anime.coverImage?.medium && (
                      <img
                        src={anime.coverImage.medium}
                        alt={anime.title.romaji}
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {anilistService.getBestChineseTitle(anime.title)}
                      </h3>
                      {anime.title.chinese &&
                        anime.title.romaji &&
                        anime.title.chinese !== anime.title.romaji && (
                          <p className="text-sm text-gray-600 truncate">
                            {anime.title.romaji}
                          </p>
                        )}

                      <div className="flex items-center space-x-2 mt-2">
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
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        {selectedAnime && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  已選擇:{" "}
                  <span className="font-medium">
                    {anilistService.getBestChineseTitle(selectedAnime.title)}
                  </span>
                </p>
                {selectedAnime.episodes && (
                  <p className="text-xs text-gray-500">
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
    </div>
  );
}
