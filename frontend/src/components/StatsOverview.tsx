import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/types";
import { Film, PlayCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsOverviewProps {
    stats: Stats | null;
    isLoading?: boolean;
}

export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
    const t = useTranslations("Home");

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-fade-in-up">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "0ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t("totalWorks")}
                    </CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.total_works}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("totalWorksDesc")}
                    </p>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "100ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t("inProgress")}
                    </CardTitle>
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.status_stats["進行中"] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("inProgressDesc")}
                    </p>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "200ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t("completed")}
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.status_stats["已完結"] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {t("completedDesc")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
