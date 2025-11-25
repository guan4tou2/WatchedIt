import { Work } from "@/types";
import WorkCard from "./WorkCard";

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
}: WorkListProps) {
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
