"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pwaService } from "@/lib/pwa";

export default function PlatformInfo() {
  const [platformInfo, setPlatformInfo] = useState<any>(null);

  useEffect(() => {
    setPlatformInfo(pwaService.getPlatformInfo());
  }, []);

  if (!platformInfo) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>平台資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>PWA 模式:</span>
            <span
              className={
                platformInfo.isPWA
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isPWA ? "是" : "否"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>行動裝置:</span>
            <span
              className={
                platformInfo.isMobile
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isMobile ? "是" : "否"}
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
              {platformInfo.isIOS ? "是" : "否"}
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
              {platformInfo.isAndroid ? "是" : "否"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>桌面:</span>
            <span
              className={
                platformInfo.isDesktop
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            >
              {platformInfo.isDesktop ? "是" : "否"}
            </span>
          </div>
        </div>
        <div className="text-xs-secondary mt-2">
          <div>User Agent:</div>
          <div className="break-all">{platformInfo.userAgent}</div>
        </div>
      </CardContent>
    </Card>
  );
}
