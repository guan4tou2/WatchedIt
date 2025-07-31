"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cloudStorage } from "@/lib/cloudStorage";
import { useWorkStore } from "@/store/useWorkStore";
import {
  Cloud,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CloudSyncStatus() {
  const { works, tags, updateWorks, updateTags } = useWorkStore();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [shouldSync, setShouldSync] = useState(false);

  useEffect(() => {
    // 檢查同步狀態
    const lastSyncTime = cloudStorage.getLastSyncTime();
    setLastSync(lastSyncTime);
    setShouldSync(cloudStorage.shouldSync());
  }, []);

  const handleSync = async () => {
    const config = cloudStorage.getConfig();
    if (!config?.endpoint) {
      alert("請先在設定中配置雲端端點");
      return;
    }

    setIsLoading(true);
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

        alert("同步成功！");
      } else {
        alert(`同步失敗: ${result.message}`);
      }
    } catch (error) {
      alert("同步失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const config = cloudStorage.getConfig();
  if (!config?.endpoint) {
    return null; // 如果沒有配置雲端，不顯示此組件
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>雲端同步</span>
          {shouldSync && (
            <Badge variant="destructive" className="ml-2">
              需要同步
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              最後同步:{" "}
              {lastSync
                ? new Date(lastSync).toLocaleString("zh-TW")
                : "從未同步"}
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
            variant={shouldSync ? "default" : "outline"}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "同步中..." : "立即同步"}
          </Button>
        </div>

        {shouldSync && (
          <div className="flex items-center space-x-2 text-orange-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>建議進行同步以確保數據最新</span>
          </div>
        )}

        {!shouldSync && lastSync && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>數據已是最新狀態</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
