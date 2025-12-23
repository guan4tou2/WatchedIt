import { Work } from "@/types";
import WorkCard from "./WorkCard";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkListProps {
    works: Work[];
    totalWorks: number;
    isBatchMode: boolean;
    selectedWorkIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onQuickAdd: (id: string, title: string, type: string) => void;
}

export default function WorkList({
    works,
    totalWorks,
    isBatchMode,
    selectedWorkIds,
    onToggleSelection,
    onQuickAdd,
    isLoading,
}: WorkListProps & { isLoading?: boolean }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm h-[200px] p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <div className="pt-4 flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (works.length === 0) {
        return (
            <div className="text-center py-8 empty-state animate-fade-in-up">
                {totalWorks === 0
                    ? "還沒有作品，開始新增你的第一個作品吧！"
                    : "沒有找到符合條件的作品"}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {works.map((work, index) => (
                <div
                    key={work.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <WorkCard
                        work={work}
                        isBatchMode={isBatchMode}
                        isSelected={selectedWorkIds.has(work.id)}
                        onToggleSelection={onToggleSelection}
                        onQuickAdd={onQuickAdd}
                    />
                </div>
            ))}
        </div>
    );
}
