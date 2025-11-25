import { useState, useMemo } from "react";
import { Work, Tag } from "@/types";

export function useWorkFilters(works: Work[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [ratingRange, setRatingRange] = useState<{ min: number; max: number }>({
        min: 0,
        max: 10,
    });
    const [progressFilter, setProgressFilter] = useState<string>("");

    const filteredWorks = useMemo(() => {
        return works
            .filter((work) => {
                // 搜尋篩選
                if (searchTerm) {
                    const searchLower = searchTerm.toLowerCase();
                    const matchesTitle = work.title.toLowerCase().includes(searchLower);
                    const matchesReview =
                        work.review?.toLowerCase().includes(searchLower) || false;
                    const matchesNote =
                        work.note?.toLowerCase().includes(searchLower) || false;
                    const matchesTags =
                        work.tags?.some((tag) =>
                            tag.name.toLowerCase().includes(searchLower)
                        ) || false;
                    if (!matchesTitle && !matchesReview && !matchesNote && !matchesTags)
                        return false;
                }

                // 類型篩選
                if (selectedType && work.type !== selectedType) return false;

                // 狀態篩選
                if (selectedStatus && work.status !== selectedStatus) return false;

                // 年份篩選
                if (selectedYear && work.year?.toString() !== selectedYear) return false;

                // 標籤篩選
                if (selectedTags.length > 0) {
                    const workTagIds = work.tags?.map((tag) => tag.id) || [];
                    const hasSelectedTag = selectedTags.some((tag) =>
                        workTagIds.includes(tag.id)
                    );
                    if (!hasSelectedTag) return false;
                }

                // 評分篩選
                if (work.rating) {
                    if (work.rating < ratingRange.min || work.rating > ratingRange.max) {
                        return false;
                    }
                }

                // 進度篩選
                if (progressFilter && work.episodes && work.episodes.length > 0) {
                    const watchedCount = work.episodes.filter((ep) => ep.watched).length;
                    const totalEpisodes = work.episodes.length;
                    const progress =
                        totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

                    switch (progressFilter) {
                        case "未開始":
                            if (watchedCount > 0) return false;
                            break;
                        case "進行中":
                            if (watchedCount === 0 || watchedCount === totalEpisodes)
                                return false;
                            break;
                        case "已完成":
                            if (watchedCount !== totalEpisodes) return false;
                            break;
                        case "高進度":
                            if (progress < 80) return false;
                            break;
                        case "低進度":
                            if (progress >= 20) return false;
                            break;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date_added || 0);
                const dateB = new Date(b.date_added || 0);
                return dateB.getTime() - dateA.getTime();
            });
    }, [
        works,
        searchTerm,
        selectedType,
        selectedStatus,
        selectedYear,
        selectedTags,
        ratingRange,
        progressFilter,
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedType("");
        setSelectedStatus("");
        setSelectedYear("");
        setSelectedTags([]);
        setRatingRange({ min: 0, max: 10 });
        setProgressFilter("");
    };

    return {
        searchTerm,
        setSearchTerm,
        selectedType,
        setSelectedType,
        selectedStatus,
        setSelectedStatus,
        selectedYear,
        setSelectedYear,
        selectedTags,
        setSelectedTags,
        ratingRange,
        setRatingRange,
        progressFilter,
        setProgressFilter,
        filteredWorks,
        clearFilters,
    };
}
