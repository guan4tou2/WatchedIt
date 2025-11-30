 "use client";

import {
    ArrowRight,
    Calendar,
    CheckSquare,
    Play,
    Plus,
    Square,
    Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Work } from "@/types";
import { getStatusColor, getTypeColor } from "@/lib/colors";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

const WORK_STATUS_KEY_MAP: Record<Work["status"], string> = {
    進行中: "ongoing",
    已完結: "completed",
    暫停: "paused",
    放棄: "dropped",
    未播出: "notStarted",
    已取消: "cancelled",
};

const WORK_TYPE_KEY_MAP: Record<string, string> = {
    動畫: "anime",
    電影: "movie",
    電視劇: "tv",
    小說: "novel",
    漫畫: "manga",
    遊戲: "game",
};

interface WorkCardProps {
    work: Work;
    isBatchMode: boolean;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onQuickAdd: (id: string, title: string, type: string) => void;
}

export default function WorkCard({
    work,
    isBatchMode,
    isSelected,
    onToggleSelection,
    onQuickAdd,
}: WorkCardProps) {
    const episodes = work.episodes || [];
    const watchedCount = episodes.filter((ep) => ep.watched).length;
    const totalEpisodes = episodes.length;

    const router = useRouter();
    const workStatusT = useTranslations("Work.status");
    const workTypeT = useTranslations("Work.type");
    const workCardButtonsT = useTranslations("WorkCard.buttons");
    const workCardLabelsT = useTranslations("WorkCard.labels");

    const statusKey = WORK_STATUS_KEY_MAP[work.status];
    const typeKey = WORK_TYPE_KEY_MAP[work.type];
    const statusLabel = statusKey ? workStatusT(statusKey) : work.status;
    const typeLabel = typeKey ? workTypeT(typeKey) : work.type;

    return (
        <Card
            className={`hover:shadow-lg transition-all card-hover ${isBatchMode ? "cursor-pointer" : "cursor-pointer"
                } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
            onClick={() => {
                if (isBatchMode) {
                    onToggleSelection(work.id);
                } else {
                    router.push(`/works/detail?id=${work.id}`);
                }
            }}
        >
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-start space-x-2 flex-1">
                        {isBatchMode && (
                            <div className="flex items-center mt-1">
                                {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Square className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                        )}
                        <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                            {work.title}
                        </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isBatchMode && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onQuickAdd(work.id, work.title, work.type);
                                }}
                                className="text-xs sm:text-sm active:scale-95 transition-transform"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                <span className="hidden sm:inline">
                                    {workCardButtonsT("quickAddFull")}
                                </span>
                                <span className="sm:hidden">
                                    {workCardButtonsT("quickAddShort")}
                                </span>
                            </Button>
                        )}
                        {!isBatchMode && (
                            <ArrowRight className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <Badge
                        variant={
                            work.status === "已完結"
                                ? "default"
                                : work.status === "進行中"
                                    ? "secondary"
                                    : "outline"
                        }
                        className={getStatusColor(work.status)}
                    >
                        {statusLabel}
                    </Badge>
                    <Badge className={getTypeColor(work.type)}>{typeLabel}</Badge>
                </div>

                {work.rating && (
                    <div className="flex items-center justify-end">
                        <Star className="w-4 h-4 star-icon mr-1" />
                        <span className="text-sm">{work.rating}/10</span>
                    </div>
                )}

                {work.review && (
                    <p className="text-xs description-text line-clamp-2">{work.review}</p>
                )}

                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span className="note-text">
                            {work.year || workCardLabelsT("unknownYear")}
                        </span>
                    </div>
                    {totalEpisodes > 0 && (
                        <div className="flex items-center space-x-1">
                            <Play className="w-3 h-3" />
                            <span className="note-text">
                                {watchedCount}/{totalEpisodes}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm description-text">
                        {work.tags?.map((tag) => (
                            <Badge key={tag.id} className="text-xs">
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
