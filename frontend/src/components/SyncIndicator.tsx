"use client";

import { useCloudSync } from "@/hooks/useCloudSync";
import { RefreshCw, CloudOff, AlertCircle } from "lucide-react";


export default function SyncIndicator() {
    const { isSyncing, shouldSync, error, hasConfig } = useCloudSync();

    if (!hasConfig) return null;

    const getTitle = () => {
        if (isSyncing) return "正在同步中...";
        if (error) return `同步失敗: ${error}`;
        if (shouldSync) return "建議進行同步";
        return "數據已同步";
    };

    return (
        <div
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent cursor-help"
            title={getTitle()}
        >
            {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            ) : error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
            ) : shouldSync ? (
                <RefreshCw className="w-4 h-4 text-orange-500" />
            ) : (
                <RefreshCw className="w-4 h-4 text-muted-foreground opacity-50" />
            )}
        </div>
    );
}
