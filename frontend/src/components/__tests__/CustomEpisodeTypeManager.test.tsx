import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CustomEpisodeTypeManager from "../CustomEpisodeTypeManager";
import { customEpisodeTypeStorage } from "@/lib/customEpisodeTypes";

jest.mock("@/lib/customEpisodeTypes", () => ({
  customEpisodeTypeStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleEnabled: jest.fn(),
    resetToDefault: jest.fn(),
    isNameDuplicate: jest.fn(),
  },
}));

const episodeTypes = [
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
  {
    id: "custom-special",
    name: "special",
    label: "特典",
    color: "#F97316",
    icon: "S",
    isDefault: false,
    isEnabled: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

describe("CustomEpisodeTypeManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(customEpisodeTypeStorage.getAll).mockReturnValue(episodeTypes);
    jest.mocked(customEpisodeTypeStorage.delete).mockReturnValue(true);
    jest.mocked(customEpisodeTypeStorage.resetToDefault).mockReturnValue(
      undefined
    );
    jest.mocked(customEpisodeTypeStorage.isNameDuplicate).mockReturnValue(
      false
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("confirms custom episode type deletion with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<CustomEpisodeTypeManager />);

    await user.click(screen.getByRole("button", { name: "刪除特典" }));

    expect(
      await screen.findByRole("alertdialog", { name: "刪除集數類型" })
    ).toBeInTheDocument();
    expect(screen.getByText("將刪除集數類型「特典」，且無法復原。")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(customEpisodeTypeStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(customEpisodeTypeStorage.delete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "刪除特典" }));
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() =>
      expect(customEpisodeTypeStorage.delete).toHaveBeenCalledWith(
        "custom-special"
      )
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("confirms reset to default episode types with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<CustomEpisodeTypeManager />);

    await user.click(screen.getByRole("button", { name: "重置預設" }));

    expect(
      await screen.findByRole("alertdialog", { name: "重置集數類型" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("將清除所有自訂集數類型，並恢復預設設定。")
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(customEpisodeTypeStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(customEpisodeTypeStorage.resetToDefault).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "重置預設" }));
    await user.click(screen.getByRole("button", { name: "確認重置" }));

    await waitFor(() =>
      expect(customEpisodeTypeStorage.resetToDefault).toHaveBeenCalledTimes(1)
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
