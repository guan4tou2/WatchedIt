import { useState, useEffect, useCallback } from "react";
import { cloudStorage } from "@/lib/cloudStorage";
import { useWorkStore } from "@/store/useWorkStore";

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

    const sync = async () => {
        const config = cloudStorage.getConfig();
        if (!config?.endpoint) {
            setError("請先在設定中配置雲端端點");
            return false;
        }

        setIsSyncing(true);
        setError(null);

        try {
            const result = await cloudStorage.syncData(works, tags);

            if (result.success && result.data) {
                // 更新本地數據
                updateWorks(result.data.works);
                updateTags(result.data.tags);
                cloudStorage.setLastSyncTime();

                // 更新狀態
                setLastSync(new Date().toISOString());
                setShouldSync(false);
                return true;
            } else {
                setError(result.message || "同步失敗");
                return false;
            }
        } catch (err) {
            setError("同步發生未知錯誤");
            return false;
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
