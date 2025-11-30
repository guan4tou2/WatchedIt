"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pwaService } from "@/lib/pwa";
import { useTranslations } from "next-intl";

export default function PlatformInfo() {
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const t = useTranslations("PlatformInfo");

  useEffect(() => {
    setPlatformInfo(pwaService.getPlatformInfo());
  }, []);

  if (!platformInfo) return null;

  const yes = t("yes", { defaultMessage: "是" });
  const no = t("no", { defaultMessage: "否" });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{t("title", { defaultMessage: "平台資訊" })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>{t("fields.pwaMode", { defaultMessage: "PWA 模式" })}:</span>
            <span
              className={
                platformInfo.isPWA
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isPWA ? yes : no}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("fields.mobile", { defaultMessage: "行動裝置" })}:</span>
            <span
              className={
                platformInfo.isMobile
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isMobile ? yes : no}
            </span>
          </div>
          <div className="flex justify-between">
            <span>iOS:</span>
            <span
              className={
                platformInfo.isIOS
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isIOS ? yes : no}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Android:</span>
            <span
              className={
                platformInfo.isAndroid
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isAndroid ? yes : no}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("fields.desktop", { defaultMessage: "桌面" })}:</span>
            <span
              className={
                platformInfo.isDesktop
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isDesktop ? yes : no}
            </span>
          </div>
        </div>
        <div className="text-xs-secondary mt-2">
          <div>{t("fields.userAgent", { defaultMessage: "User Agent" })}:</div>
          <div className="break-all">{platformInfo.userAgent}</div>
        </div>
      </CardContent>
    </Card>
  );
}
