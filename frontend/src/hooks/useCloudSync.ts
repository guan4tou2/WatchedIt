import { useState, useEffect, useCallback } from "react";
import { cloudStorage } from "@/lib/cloudStorage";
import { useWorkStore } from "@/store/useWorkStore";

export interface CloudSyncActionResult {
    success: boolean;
    error?: string;
}

export function useCloudSync() {
    const { works, tags, updateWorks, updateTags, isSyncing, setIsSyncing } = useWorkStore();
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [shouldSync, setShouldSync] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkSyncStatus = useCallback(() => {
        const lastSyncTime = cloudStorage.getLastSyncTime();
        setLastSync(lastSyncTime);
        setShouldSync(cloudStorage.shouldSync());
    }, []);

    useEffect(() => {
        checkSyncStatus();
    }, [checkSyncStatus]);

    const sync = async (): Promise<CloudSyncActionResult> => {
        const config = cloudStorage.getConfig();
        if (!config?.endpoint) {
            const errorMessage = "請先在設定中配置雲端端點";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        setIsSyncing(true);
        setError(null);

        try {
            const result = await cloudStorage.syncData(works, tags);

            if (result.success && result.data) {
                // 更新本地數據
                await updateWorks(result.data.works);
                await updateTags(result.data.tags);
                cloudStorage.setLastSyncTime();

                // 更新狀態
                setLastSync(new Date().toISOString());
                setShouldSync(false);
                return { success: true };
            } else {
                const errorMessage = result.error || result.message || "同步失敗";
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "同步發生未知錯誤";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        isSyncing,
        lastSync,
        shouldSync,
        error,
        sync,
        checkSyncStatus,
        hasConfig: !!cloudStorage.getConfig()?.endpoint
    };
}
