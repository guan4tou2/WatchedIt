import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WorkTypeManager from "../WorkTypeManager";
import { workTypeStorage } from "@/lib/workTypes";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";

jest.mock("@/lib/workTypes", () => ({
  DEFAULT_WORK_TYPES: [
    {
      id: "anime",
      name: "動畫",
      color: "#3B82F6",
      icon: "🎬",
      description: "日本動畫作品",
      isDefault: true,
      isEnabled: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  workTypeStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleEnabled: jest.fn(),
    resetToDefault: jest.fn(),
    isNameDuplicate: jest.fn(),
  },
}));

jest.mock("@/lib/workTypeEpisodeMapping", () => ({
  DEFAULT_WORK_TYPE_EPISODE_MAPPING: [
    {
      workType: "動畫",
      episodeTypes: ["episode"],
      defaultEpisodeType: "episode",
    },
  ],
  workTypeEpisodeMappingStorage: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetToDefault: jest.fn(),
    getByWorkType: jest.fn(),
  },
}));

jest.mock("@/lib/customEpisodeTypes", () => ({
  customEpisodeTypeStorage: {
    getEnabledTypes: jest.fn().mockReturnValue([
      {
        id: "episode",
        name: "episode",
        label: "正篇",
        color: "#3B82F6",
        icon: "E",
        isDefault: true,
        isEnabled: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]),
  },
}));

const workTypes = [
  {
    id: "anime",
    name: "動畫",
    color: "#3B82F6",
    icon: "🎬",
    description: "日本動畫作品",
    isDefault: true,
    isEnabled: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "custom-stage",
    name: "舞台劇",
    color: "#F97316",
    icon: "🎭",
    description: "現場演出",
    isDefault: false,
    isEnabled: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("WorkTypeManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(workTypeStorage.getAll).mockReturnValue(workTypes);
    jest.mocked(workTypeStorage.delete).mockReturnValue(true);
    jest.mocked(workTypeStorage.resetToDefault).mockReturnValue(undefined);
    jest.mocked(workTypeStorage.isNameDuplicate).mockReturnValue(false);
    jest.mocked(workTypeEpisodeMappingStorage.delete).mockReturnValue(true);
    jest.mocked(workTypeEpisodeMappingStorage.resetToDefault).mockReturnValue(
      undefined
    );
    jest
      .mocked(workTypeEpisodeMappingStorage.getByWorkType)
      .mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("confirms custom type deletion with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<WorkTypeManager />);

    await user.click(screen.getByRole("button", { name: "刪除舞台劇" }));

    expect(
      await screen.findByRole("alertdialog", { name: "刪除作品類型" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("將刪除「舞台劇」及其集數類型對應，且無法復原。")
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(workTypeStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(workTypeStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "刪除舞台劇" }));
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() =>
      expect(workTypeStorage.delete).toHaveBeenCalledWith("custom-stage")
    );
    expect(workTypeEpisodeMappingStorage.delete).toHaveBeenCalledWith("舞台劇");
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("confirms reset to defaults with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<WorkTypeManager />);

    await user.click(screen.getByRole("button", { name: "重置預設" }));

    expect(
      await screen.findByRole("alertdialog", { name: "重置作品類型" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "將清除所有自訂作品類型與集數類型對應，並恢復預設設定。"
      )
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(workTypeStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(workTypeStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "重置預設" }));
    await user.click(screen.getByRole("button", { name: "確認重置" }));

    await waitFor(() =>
      expect(workTypeStorage.resetToDefault).toHaveBeenCalledTimes(1)
    );
    expect(workTypeEpisodeMappingStorage.resetToDefault).toHaveBeenCalledTimes(
      1
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
