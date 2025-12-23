"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCloudSync } from "@/hooks/useCloudSync";
import {
  Cloud,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CloudSyncStatus() {
  const {
    isSyncing,
    lastSync,
    shouldSync,
    error,
    sync: handleSync,
    hasConfig
  } = useCloudSync();

  const handleSyncClick = async () => {
    const success = await handleSync();
    if (success) {
      alert("同步成功！");
    } else if (error) {
      // Error handled by hook state, but alert might be wanted
      alert(`同步失敗: ${error}`);
    }
  };

  if (!hasConfig) {
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
            <Clock className="w-4 h-4 note-text" />
            <span className="text-sm description-text">
              最後同步:{" "}
              {lastSync
                ? new Date(lastSync).toLocaleString("zh-TW")
                : "從未同步"}
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleSyncClick}
            disabled={isSyncing}
            variant={shouldSync ? "default" : "outline"}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "同步中..." : "立即同步"}
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
