"use client";

import { useState, useRef } from "react";
import { backupService, BackupFormat } from "@/lib/backup";
import { useWorkStore } from "@/store/useWorkStore";
import {
  Download,
  Upload,
  Database,
  FileText,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RefreshCw,
  HardDrive,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslations, useLocale } from "next-intl";

interface BackupRestoreProps {
  onDataChange?: () => void;
}

export default function BackupRestore({ onDataChange }: BackupRestoreProps) {
  const { fetchWorks, fetchTags } = useWorkStore();
  const t = useTranslations("BackupRestore");
  const commonT = useTranslations("Common");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [autoBackupList, setAutoBackupList] = useState<
    Array<{ date: string; size: number }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 載入資料庫資訊
  const loadDatabaseInfo = async () => {
    try {
      const info = await backupService.getDatabaseInfo();
      setDatabaseInfo(info);
    } catch (error) {
      console.error("載入資料庫資訊失敗:", error);
    }
  };

  // 載入自動備份列表
  const loadAutoBackupList = () => {
    const list = backupService.getAutoBackupList();
    setAutoBackupList(list);
  };

  // 顯示訊息
  const showMessage = (type: "success" | "error" | "warning", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 匯出備份
  const handleExportBackup = async (format: BackupFormat) => {
    setIsLoading(true);
    try {
      await backupService.exportBackup(format);
      showMessage(
        "success",
        t("messages.exportSuccess", {
          defaultMessage: "備份已匯出為 {format} 格式",
          format: format.toUpperCase(),
        })
      );
    } catch (error) {
      showMessage("error", t("messages.exportError", { defaultMessage: "匯出備份失敗" }));
    } finally {
      setIsLoading(false);
    }
  };

  // 匯入備份
  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const backupData = await backupService.importBackup(file);

      // 確認還原
      const confirmMessage = t("import.confirmRestore", {
        defaultMessage: `確定要還原備份嗎？\n\n備份資訊：\n- 作品：{works} 個\n- 標籤：{tags} 個\n- 集數：{episodes} 集\n- 完成率：{completion}%\n\n此操作將覆蓋現有資料！`,
        works: backupData.metadata.totalWorks,
        tags: backupData.metadata.totalTags,
        episodes: backupData.metadata.totalEpisodes,
        completion: backupData.metadata.completionRate,
      });

      if (confirm(confirmMessage)) {
        await backupService.restoreBackup(backupData);
        await fetchWorks();
        await fetchTags();
        showMessage("success", t("messages.restoreSuccess", { defaultMessage: "備份還原成功" }));
        onDataChange?.();
      }
    } catch (error) {
      showMessage("error", t("messages.importError", { defaultMessage: "匯入備份失敗" }));
    } finally {
      setIsLoading(false);
      // 清除檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 自動備份
  const handleAutoBackup = async () => {
    setIsLoading(true);
    try {
      await backupService.autoBackup();
      loadAutoBackupList();
      showMessage("success", t("messages.autoBackupSuccess", { defaultMessage: "自動備份完成" }));
    } catch (error) {
      showMessage("error", t("messages.autoBackupError", { defaultMessage: "自動備份失敗" }));
    } finally {
      setIsLoading(false);
    }
  };

  // 從自動備份還原
  const handleRestoreFromAutoBackup = async (date: string) => {
    if (
      !confirm(
        t("auto.list.restoreConfirm", {
          defaultMessage: "確定要從 {date} 的自動備份還原嗎？此操作將覆蓋現有資料！",
          date
        })
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await backupService.restoreFromAutoBackup(date);
      await fetchWorks();
      await fetchTags();
      showMessage(
        "success",
        t("messages.autoRestoreSuccess", { defaultMessage: "從自動備份還原成功" })
      );
      onDataChange?.();
    } catch (error) {
      showMessage(
        "error",
        t("messages.autoRestoreError", { defaultMessage: "從自動備份還原失敗" })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 清除所有自動備份
  const handleClearAllAutoBackups = () => {
    const keys = Object.keys(localStorage);
    const autoBackupKeys = keys.filter((key) =>
      key.startsWith("watchedit_auto_backup_")
    );

    autoBackupKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    loadAutoBackupList();
    showMessage(
      "success",
      t("messages.autoClearSuccess", { defaultMessage: "所有自動備份已清除" })
    );
  };

  // 格式化檔案大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 訊息顯示 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : message.type === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-yellow-50 text-yellow-800 border border-yellow-200"
            }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" && <CheckCircle className="w-4 h-4" />}
            {message.type === "error" && <AlertTriangle className="w-4 h-4" />}
            {message.type === "warning" && (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* 資料庫資訊 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {t("database.title", { defaultMessage: "資料庫資訊" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {databaseInfo?.worksCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("database.works", { defaultMessage: "作品" })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {databaseInfo?.tagsCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("database.tags", { defaultMessage: "標籤" })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {databaseInfo?.totalEpisodes || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("database.episodes", { defaultMessage: "集數" })}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {databaseInfo?.completionRate || 0}%
              </div>
              <div className="text-sm text-muted-foreground">
                {t("database.completion", { defaultMessage: "完成率" })}
              </div>
            </div>
          </div>
          {databaseInfo?.lastBackup && (
            <div className="mt-4 text-sm text-muted-foreground">
              {t("database.lastBackup", { defaultMessage: "最後備份" })}：
              {formatDate(databaseInfo.lastBackup)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 備份還原功能 */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">
            {t("tabs.manual", { defaultMessage: "手動備份" })}
          </TabsTrigger>
          <TabsTrigger value="auto">
            {t("tabs.auto", { defaultMessage: "自動備份" })}
          </TabsTrigger>
          <TabsTrigger value="import">
            {t("tabs.import", { defaultMessage: "匯入還原" })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("manual.title", { defaultMessage: "手動備份" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExportBackup("json")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {t("manual.exportJson", { defaultMessage: "匯出 JSON 備份" })}
                </Button>
                <Button
                  onClick={() => handleExportBackup("csv")}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t("manual.exportCsv", { defaultMessage: "匯出 CSV 備份" })}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("manual.description", { defaultMessage: "JSON 格式包含完整的資料結構，CSV 格式便於在試算表中查看。" })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t("auto.title", { defaultMessage: "自動備份" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {t("auto.backupNow.title", { defaultMessage: "立即備份" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("auto.backupNow.description", { defaultMessage: "建立自動備份並儲存在瀏覽器中" })}
                  </p>
                </div>
                <Button
                  onClick={handleAutoBackup}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("auto.backupNow.button", { defaultMessage: "建立備份" })}
                </Button>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">
                    {t("auto.list.title", { defaultMessage: "自動備份列表" })}
                  </h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t("auto.list.clearAll", { defaultMessage: "清除全部" })}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("auto.list.clearTitle", { defaultMessage: "清除所有自動備份" })}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("auto.list.clearDescription", { defaultMessage: "此操作將永久刪除所有自動備份，無法復原。確定要繼續嗎？" })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {commonT("cancel", { defaultMessage: "取消" })}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllAutoBackups}>
                          {t("auto.list.clearConfirm", { defaultMessage: "確定清除" })}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {autoBackupList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("auto.list.empty", { defaultMessage: "尚無自動備份" })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {autoBackupList.map((backup) => (
                      <div
                        key={backup.date}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <HardDrive className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{backup.date}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(backup.size)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRestoreFromAutoBackup(backup.date)
                          }
                          disabled={isLoading}
                        >
                          {t("auto.list.restoreButton", { defaultMessage: "還原" })}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t("import.title", { defaultMessage: "匯入還原" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-2">
                  {t("import.chooseFile.title", { defaultMessage: "選擇備份檔案" })}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("import.chooseFile.description", { defaultMessage: "支援 JSON 和 CSV 格式的備份檔案" })}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {t("import.chooseFile.button", { defaultMessage: "選擇檔案" })}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {t("import.tips.item1", { defaultMessage: "• 支援 JSON 格式的完整備份檔案" })}
                </p>
                <p>
                  {t("import.tips.item2", { defaultMessage: "• 支援 CSV 格式的資料匯出檔案" })}
                </p>
                <p>
                  {t("import.tips.item3", { defaultMessage: "• 還原操作將覆蓋現有資料，請謹慎操作" })}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 注意事項 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("notes.title", { defaultMessage: "注意事項" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              1
            </Badge>
            <p>
              {t("notes.item1", { defaultMessage: "手動備份會下載檔案到您的裝置，建議定期備份重要資料" })}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              2
            </Badge>
            <p>
              {t("notes.item2", { defaultMessage: "自動備份儲存在瀏覽器中，清除瀏覽器資料會遺失備份" })}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              3
            </Badge>
            <p>
              {t("notes.item3", { defaultMessage: "還原操作會覆蓋現有資料，請確保已備份重要資料" })}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5">
              4
            </Badge>
            <p>
              {t("notes.item4", { defaultMessage: "不同版本的備份可能不完全相容，建議使用相同版本" })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
