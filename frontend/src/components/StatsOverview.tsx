import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/types";

interface StatsOverviewProps {
    stats: Stats | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                        總作品數
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                        {stats.total_works}
                    </div>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                        進行中
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                        {stats.status_stats["進行中"] || 0}
                    </div>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">
                        已完結
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                        {stats.status_stats["已完結"] || 0}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
