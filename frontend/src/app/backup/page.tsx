"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import BackupRestore from "@/components/BackupRestore";

export default function BackupPage() {
  const router = useRouter();

  useEffect(() => {
    // 頁面載入時的初始化
    document.title = "備份還原 - WatchedIt";
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* 頁面標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <Logo showText={false} />
          <h1 className="text-2xl sm:text-3xl font-bold">備份還原</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            設定
          </Button>
        </div>
      </div>

      {/* 功能說明 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              資料備份還原功能
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>
                • <strong>手動備份</strong>：匯出 JSON 或 CSV 格式的備份檔案
              </p>
              <p>
                • <strong>自動備份</strong>：在瀏覽器中建立本地備份
              </p>
              <p>
                • <strong>匯入還原</strong>：從備份檔案還原資料
              </p>
              <p>
                • <strong>資料安全</strong>：保護您的觀看記錄和設定
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 備份還原組件 */}
      <BackupRestore
        onDataChange={() => {
          // 資料變更時可以觸發重新載入
          console.log("資料已變更");
        }}
      />
    </div>
  );
}
