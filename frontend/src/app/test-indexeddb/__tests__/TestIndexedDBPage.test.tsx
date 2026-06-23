import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TestIndexedDBPage from "../page";
import { dbUtils, tagStorage, workStorage } from "@/lib/indexedDB";

jest.mock("@/lib/indexedDB", () => ({
  workStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
  },
  tagStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
  },
  dbUtils: {
    getDatabaseInfo: jest.fn(),
    clearAll: jest.fn(),
    exportData: jest.fn(),
  },
}));

describe("TestIndexedDBPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(workStorage.getAll).mockResolvedValue([]);
    jest.mocked(tagStorage.getAll).mockResolvedValue([]);
    jest.mocked(dbUtils.getDatabaseInfo).mockResolvedValue({
      worksCount: 0,
      tagsCount: 0,
    });
    jest.mocked(dbUtils.clearAll).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("confirms clearing all IndexedDB test data with an inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<TestIndexedDBPage />);

    await user.click(
      await screen.findByRole("button", { name: "清空所有數據" })
    );

    expect(
      await screen.findByRole("alertdialog", { name: "清空所有數據" })
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(dbUtils.clearAll).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(dbUtils.clearAll).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "清空所有數據" }));
    await user.click(screen.getByRole("button", { name: "確認清空" }));

    await waitFor(() => expect(dbUtils.clearAll).toHaveBeenCalledTimes(1));
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
