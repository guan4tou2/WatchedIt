"use client";

import { useCloudSync } from "@/hooks/useCloudSync";
import { useTranslations } from "next-intl";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function SyncIndicator() {
    const t = useTranslations("SyncIndicator");
    const { isSyncing, shouldSync, error, hasConfig } = useCloudSync();

    if (!hasConfig) return null;

    const getStatusLabel = () => {
        if (isSyncing) return t("states.syncing");
        if (error) return t("states.error", { error });
        if (shouldSync) return t("states.needsSync");
        return t("states.synced");
    };

    const statusLabel = getStatusLabel();

    return (
        <div
            role="status"
            aria-label={statusLabel}
            aria-live="polite"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent cursor-help"
            title={statusLabel}
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
