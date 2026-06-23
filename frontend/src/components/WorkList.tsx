import { Work } from "@/types";
import WorkCard from "./WorkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Plus, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

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
    const emptyT = useTranslations("WorkList.empty");
    const noResultsT = useTranslations("WorkList.noResults");

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
        if (totalWorks === 0) {
            return (
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center animate-fade-in-up">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                        {emptyT("title")}
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                        {emptyT("description")}
                    </p>
                    <Button asChild className="mt-5">
                        <Link href="/works/new">
                            <Plus className="mr-2 h-4 w-4" />
                            {emptyT("action")}
                        </Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center animate-fade-in-up">
                <SearchX className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                    {noResultsT("title")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {noResultsT("description")}
                </p>
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
