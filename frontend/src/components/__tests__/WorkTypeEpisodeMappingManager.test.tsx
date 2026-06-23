import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WorkTypeEpisodeMappingManager from "../WorkTypeEpisodeMappingManager";
import { workTypeEpisodeMappingStorage } from "@/lib/workTypeEpisodeMapping";

jest.mock("@/lib/workTypeEpisodeMapping", () => ({
  workTypeEpisodeMappingStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    resetToDefault: jest.fn(),
  },
}));

jest.mock("@/lib/workTypes", () => ({
  workTypeStorage: {
    getEnabled: jest.fn().mockReturnValue([
      {
        id: "anime",
        name: "動畫",
        color: "#3B82F6",
        isDefault: true,
        isEnabled: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]),
  },
}));

const mappings = [
  {
    workType: "動畫",
    episodeTypes: ["episode", "special"] as const,
    defaultEpisodeType: "episode" as const,
  },
  {
    workType: "舞台劇",
    episodeTypes: ["episode"] as const,
    defaultEpisodeType: "episode" as const,
  },
];

describe("WorkTypeEpisodeMappingManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(workTypeEpisodeMappingStorage.getAll).mockReturnValue(mappings);
    jest.mocked(workTypeEpisodeMappingStorage.delete).mockReturnValue(true);
    jest.mocked(workTypeEpisodeMappingStorage.resetToDefault).mockReturnValue(
      undefined
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("confirms mapping deletion with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<WorkTypeEpisodeMappingManager />);

    await user.click(screen.getByRole("button", { name: "刪除舞台劇對應" }));

    expect(
      await screen.findByRole("alertdialog", { name: "刪除對應關係" })
    ).toBeInTheDocument();
    expect(screen.getByText("將刪除「舞台劇」的對應關係，且無法復原。")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(workTypeEpisodeMappingStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(workTypeEpisodeMappingStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "刪除舞台劇對應" }));
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() =>
      expect(workTypeEpisodeMappingStorage.delete).toHaveBeenCalledWith(
        "舞台劇"
      )
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("confirms reset to default mappings with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<WorkTypeEpisodeMappingManager />);

    await user.click(screen.getByRole("button", { name: "重置預設" }));

    expect(
      await screen.findByRole("alertdialog", { name: "重置對應關係" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("將清除所有自訂對應關係，並恢復預設設定。")
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(workTypeEpisodeMappingStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(workTypeEpisodeMappingStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "重置預設" }));
    await user.click(screen.getByRole("button", { name: "確認重置" }));

    await waitFor(() =>
      expect(workTypeEpisodeMappingStorage.resetToDefault).toHaveBeenCalledTimes(
        1
      )
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
