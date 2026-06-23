import { fireEvent, render, screen } from "@testing-library/react";
import BatchActionBar from "../BatchActionBar";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    return (key: string, values?: { count?: number }) =>
      values?.count !== undefined
        ? `${namespace}.${key}:${values.count}`
        : `${namespace}.${key}`;
  },
}));

const defaultProps = {
  isBatchMode: false,
  filteredCount: 3,
  selectedCount: 0,
  onToggleBatchMode: jest.fn(),
  onSelectAll: jest.fn(),
  onClearSelection: jest.fn(),
  onBatchEdit: jest.fn(),
  onBatchDelete: jest.fn(),
};

describe("BatchActionBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a compact batch select action outside batch mode", () => {
    render(<BatchActionBar {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Home.actions.batchSelect" })
    );

    expect(defaultProps.onToggleBatchMode).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Home.labels.selectedCount:0")
    ).not.toBeInTheDocument();
  });

  it("shows selection count and enabled batch actions when works are selected", () => {
    render(
      <BatchActionBar
        {...defaultProps}
        isBatchMode
        selectedCount={2}
      />
    );

    expect(screen.getByText("Home.labels.selectedCount:2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Home.actions.batchEditCount:2" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Home.actions.batchDeleteCount:2" })
    ).toBeEnabled();
  });

  it("keeps edit and delete visible but disabled with no selection", () => {
    render(<BatchActionBar {...defaultProps} isBatchMode />);

    expect(screen.getByText("Home.labels.selectedCount:0")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Home.actions.batchEditCount:0" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Home.actions.batchDeleteCount:0" })
    ).toBeDisabled();
  });
});
