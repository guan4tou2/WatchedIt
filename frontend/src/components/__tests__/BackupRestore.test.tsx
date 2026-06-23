import React, { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BackupRestore from "../BackupRestore";
import { backupService } from "@/lib/backup";

const translationMap: Record<string, string> = {
  "Common.cancel": "取消",
  "BackupRestore.database.title": "資料庫資訊",
  "BackupRestore.database.works": "作品",
  "BackupRestore.database.tags": "標籤",
  "BackupRestore.database.episodes": "集數",
  "BackupRestore.database.completion": "完成率",
  "BackupRestore.database.lastBackup": "最後備份",
  "BackupRestore.tabs.manual": "手動備份",
  "BackupRestore.tabs.auto": "自動備份",
  "BackupRestore.tabs.import": "匯入還原",
  "BackupRestore.manual.title": "手動備份",
  "BackupRestore.manual.exportJson": "匯出 JSON 備份",
  "BackupRestore.manual.exportCsv": "匯出 CSV 備份",
  "BackupRestore.manual.description":
    "JSON 格式包含完整的資料結構，CSV 格式便於在試算表中查看。",
  "BackupRestore.auto.title": "自動備份",
  "BackupRestore.auto.backupNow.title": "立即備份",
  "BackupRestore.auto.backupNow.description":
    "建立自動備份並儲存在瀏覽器中",
  "BackupRestore.auto.backupNow.button": "建立備份",
  "BackupRestore.auto.list.title": "自動備份列表",
  "BackupRestore.auto.list.clearAll": "清除全部",
  "BackupRestore.auto.list.clearTitle": "清除所有自動備份",
  "BackupRestore.auto.list.clearDescription":
    "此操作將永久刪除所有自動備份，無法復原。確定要繼續嗎？",
  "BackupRestore.auto.list.clearConfirm": "確定清除",
  "BackupRestore.auto.list.empty": "尚無自動備份",
  "BackupRestore.auto.list.restoreButton": "還原",
  "BackupRestore.auto.list.restoreTitle": "還原自動備份",
  "BackupRestore.auto.list.restoreDescription":
    "確定要從 2024/01/10 10:00 的自動備份還原嗎？此操作將覆蓋現有資料。",
  "BackupRestore.auto.list.restoreConfirm": "確認還原",
  "BackupRestore.import.title": "匯入還原",
  "BackupRestore.import.chooseFile.title": "選擇備份檔案",
  "BackupRestore.import.chooseFile.description":
    "支援 JSON 和 CSV 格式的備份檔案",
  "BackupRestore.import.chooseFile.button": "選擇檔案",
  "BackupRestore.import.confirmTitle": "確認還原備份",
  "BackupRestore.import.confirmDescription":
    "即將還原：作品 0 個，標籤 0 個，集數 0 集，完成率 0%。此操作將覆蓋現有資料。",
  "BackupRestore.import.confirmAction": "確認還原",
  "BackupRestore.import.tips.item1": "• 支援 JSON 格式的完整備份檔案",
  "BackupRestore.import.tips.item2": "• 支援 CSV 格式的資料匯出檔案",
  "BackupRestore.import.tips.item3": "• 還原操作將覆蓋現有資料，請謹慎操作",
  "BackupRestore.notes.title": "注意事項",
  "BackupRestore.notes.item1":
    "手動備份會下載檔案到您的裝置，建議定期備份重要資料",
  "BackupRestore.notes.item2":
    "自動備份儲存在瀏覽器中，清除瀏覽器資料會遺失備份",
  "BackupRestore.notes.item3":
    "還原操作會覆蓋現有資料，請確保已備份重要資料",
  "BackupRestore.notes.item4":
    "不同版本的備份可能不完全相容，建議使用相同版本",
  "BackupRestore.messages.exportSuccess": "備份已匯出為 {format} 格式",
  "BackupRestore.messages.exportError": "匯出備份失敗",
  "BackupRestore.messages.autoBackupSuccess": "自動備份完成",
  "BackupRestore.messages.autoBackupError": "自動備份失敗",
  "BackupRestore.messages.autoClearSuccess": "所有自動備份已清除",
  "BackupRestore.messages.restoreSuccess": "備份還原成功",
  "BackupRestore.messages.autoRestoreSuccess": "從自動備份還原成功",
};

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    fetchWorks: jest.fn(),
    fetchTags: jest.fn(),
  }),
}));

jest.mock("next-intl", () => {
  return {
    useTranslations: (namespace: string) => {
      return (key: string, values?: Record<string, string | number>) => {
        const defaultMessage =
          typeof values?.defaultMessage === "string"
            ? values.defaultMessage
            : key;
        const lookup = translationMap[`${namespace}.${key}`] || defaultMessage;

        return lookup.replace(/\{(\w+)\}/g, (_, token) =>
          values?.[token] !== undefined ? String(values[token]) : `{${token}}`
        );
      };
    },
    useLocale: () => "zh-TW",
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

jest.mock("@/lib/backup", () => {
  const actual = jest.requireActual("@/lib/backup");
  const backupServiceMock = {
    exportBackup: jest.fn().mockResolvedValue(undefined),
    importBackup: jest.fn().mockResolvedValue({
      version: "1.0.0",
      timestamp: "2024-01-01T00:00:00.000Z",
      works: [],
      tags: [],
      metadata: {
        totalWorks: 0,
        totalTags: 0,
        totalEpisodes: 0,
        watchedEpisodes: 0,
        completionRate: 0,
      },
    }),
    restoreBackup: jest.fn().mockResolvedValue(undefined),
    autoBackup: jest.fn().mockResolvedValue(undefined),
    restoreFromAutoBackup: jest.fn().mockResolvedValue(undefined),
    getAutoBackupList: jest.fn().mockReturnValue([]),
    getDatabaseInfo: jest.fn().mockResolvedValue(null),
  };

  return {
    ...actual,
    backupService: backupServiceMock,
  };
});

const renderComponent = () => render(<BackupRestore />);

describe("BackupRestore component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("triggers JSON export and shows success message", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderComponent();

    await user.click(screen.getByRole("button", { name: /匯出 JSON 備份/ }));

    expect(backupService.exportBackup).toHaveBeenCalledWith("json");
    await waitFor(() =>
      expect(
        screen.getByText("備份已匯出為 JSON 格式")
      ).toBeInTheDocument()
    );
  });

  it("shows auto backup empty state by default", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderComponent();

    await user.click(screen.getByRole("tab", { name: "自動備份" }));
    expect(screen.getByText("尚無自動備份")).toBeInTheDocument();
  });

  it("runs auto backup flow and renders returned list", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    (backupService.getAutoBackupList as jest.Mock).mockReturnValue([
      { date: "2024/01/10 10:00", size: 2048 },
    ]);

    renderComponent();
    await user.click(screen.getByRole("tab", { name: "自動備份" }));
    await user.click(screen.getByRole("button", { name: /建立備份/ }));

    expect(backupService.autoBackup).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByText("2024/01/10 10:00")).toBeInTheDocument()
    );
    expect(backupService.getDatabaseInfo).toHaveBeenCalledTimes(2);
    expect(
      await screen.findByText("自動備份完成")
    ).toBeInTheDocument();
  });

  it("opens an inline restore confirmation after importing a backup", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const { container } = renderComponent();

    await user.click(screen.getByRole("tab", { name: "匯入還原" }));
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["{}"], "watchedit.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(await screen.findByRole("alertdialog", {
      name: "確認還原備份",
    })).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(backupService.restoreBackup).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("restores an imported backup from the inline confirmation", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { container } = renderComponent();

    await user.click(screen.getByRole("tab", { name: "匯入還原" }));
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["{}"], "watchedit.json", { type: "application/json" }),
        ],
      },
    });

    await user.click(await screen.findByRole("button", { name: "確認還原" }));

    expect(backupService.restoreBackup).toHaveBeenCalled();
    expect(await screen.findByText("備份還原成功")).toBeInTheDocument();
  });

  it("confirms auto-backup restore with an inline dialog", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    (backupService.getAutoBackupList as jest.Mock).mockReturnValue([
      { date: "2024/01/10 10:00", size: 2048 },
    ]);

    renderComponent();
    await user.click(screen.getByRole("tab", { name: "自動備份" }));
    await user.click(screen.getByRole("button", { name: "還原" }));

    expect(await screen.findByRole("alertdialog", {
      name: "還原自動備份",
    })).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "確認還原" }));

    expect(backupService.restoreFromAutoBackup).toHaveBeenCalledWith(
      "2024/01/10 10:00"
    );
    expect(await screen.findByText("從自動備份還原成功")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });
});
