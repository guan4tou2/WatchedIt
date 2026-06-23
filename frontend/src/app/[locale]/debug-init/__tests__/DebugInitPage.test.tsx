import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import DebugInitPage from "../page";

const initialize = jest.fn();
const fetchWorks = jest.fn();
const createWork = jest.fn();

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    works: [],
    tags: [],
    stats: {},
    loading: false,
    error: null,
    initialize,
    fetchWorks,
    createWork,
  }),
}));

describe("DebugInitPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initialize.mockResolvedValue(undefined);
    fetchWorks.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows create test work results inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    createWork.mockResolvedValue({ id: "work-1" });

    render(<DebugInitPage />);

    await user.click(screen.getByRole("button", { name: "新增測試作品" }));

    await waitFor(() => expect(createWork).toHaveBeenCalledTimes(1));
    expect(alertSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("status", { name: "新增測試作品結果" })
    ).toHaveTextContent("作品新增成功！ID: work-1");
  });
});
