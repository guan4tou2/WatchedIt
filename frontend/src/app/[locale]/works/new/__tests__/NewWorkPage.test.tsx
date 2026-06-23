import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewWorkPage from "../page";

const push = jest.fn();
const back = jest.fn();
const createWork = jest.fn();
const showToast = jest.fn();

jest.mock("@/navigation", () => ({
  useRouter: () => ({
    push,
    back,
  }),
}));

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    return (key: string, values?: Record<string, string | number>) => {
      if (typeof values?.defaultMessage === "string") {
        return String(values.defaultMessage).replace(/\{(\w+)\}/g, (_, token) =>
          values[token] !== undefined ? String(values[token]) : `{${token}}`
        );
      }

      if (values?.value !== undefined) {
        return `${namespace}.${key}:${values.value}`;
      }

      return `${namespace}.${key}`;
    };
  },
}));

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    createWork,
    tags: [],
  }),
}));

jest.mock("@/components/TagSelector", () => function TagSelector() {
  return <div data-testid="tag-selector" />;
});

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast,
    ToastContainer: () => <div data-testid="toast-container" />,
  }),
}));

describe("NewWorkPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createWork.mockResolvedValue({ id: "work-1" });
  });

  it("exposes accessible rating controls and preserves half-point ratings", async () => {
    const user = userEvent.setup();

    render(<NewWorkPage />);

    expect(
      screen.getByRole("button", { name: "設定評分為 8/10" })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("評分數值"), "8.5");
    await user.type(screen.getByLabelText("標題 *"), "測試作品");
    fireEvent.submit(screen.getByRole("button", { name: "創建作品" }));

    await waitFor(() => expect(createWork).toHaveBeenCalledTimes(1));
    expect(createWork).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "測試作品",
        rating: 8.5,
      })
    );
  });
});
