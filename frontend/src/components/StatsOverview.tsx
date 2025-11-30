import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/types";
import { Film, PlayCircle, CheckCircle } from "lucide-react";

interface StatsOverviewProps {
    stats: Stats | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "0ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        總作品數
                    </CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.total_works}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        所有追蹤的作品
                    </p>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "100ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        進行中
                    </CardTitle>
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.status_stats["進行中"] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        正在觀看或連載中
                    </p>
                </CardContent>
            </Card>

            <Card className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: "200ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        已完結
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {stats.status_stats["已完結"] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        已完成觀看
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
