"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
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

type SyncFeedback = {
  type: "success" | "error";
  message: string;
};

export default function CloudSyncStatus() {
  const t = useTranslations("CloudSyncStatus");
  const locale = useLocale();
  const [feedback, setFeedback] = useState<SyncFeedback | null>(null);
  const {
    isSyncing,
    lastSync,
    shouldSync,
    error,
    sync: handleSync,
    hasConfig
  } = useCloudSync();

  const errorFeedbackMessage = error
    ? t("messages.error", { error })
    : null;

  useEffect(() => {
    if (!errorFeedbackMessage) {
      return;
    }

    setFeedback((current) =>
      current?.type === "error" && current.message === errorFeedbackMessage
        ? current
        : { type: "error", message: errorFeedbackMessage }
    );
  }, [errorFeedbackMessage]);

  const handleSyncClick = async () => {
    setFeedback(null);
    const result = await handleSync();
    if (result.success) {
      setFeedback({ type: "success", message: t("messages.success") });
    } else {
      setFeedback({
        type: "error",
        message: result.error
          ? t("messages.error", { error: result.error })
          : errorFeedbackMessage ?? t("messages.errorFallback"),
      });
    }
  };

  if (!hasConfig) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="w-5 h-5" />
          <span>{t("title")}</span>
          {shouldSync && (
            <Badge variant="destructive" className="ml-2">
              {t("badges.needsSync")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 note-text" />
            <span className="text-sm description-text">
              {t("labels.lastSync")}{" "}
              {lastSync
                ? new Date(lastSync).toLocaleString(locale)
                : t("labels.neverSynced")}
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
            {isSyncing ? t("buttons.syncing") : t("buttons.syncNow")}
          </Button>
        </div>

        {feedback && (
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            aria-live={feedback.type === "error" ? "assertive" : "polite"}
            className={`rounded-md border px-3 py-2 text-sm ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {shouldSync && (
          <div className="flex items-center space-x-2 text-orange-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{t("messages.needsSync")}</span>
          </div>
        )}

        {!shouldSync && lastSync && (
          <div className="flex items-center space-x-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{t("messages.upToDate")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
