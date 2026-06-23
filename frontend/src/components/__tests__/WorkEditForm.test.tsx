import { fireEvent, render, screen } from "@testing-library/react";
import WorkEditForm from "../WorkEditForm";
import { Work } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    return (key: string, values?: { value?: number }) =>
      values?.value !== undefined
        ? `${namespace}.${key}:${values.value}`
        : `${namespace}.${key}`;
  },
}));

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    tags: [],
  }),
}));

const mockWork: Work = {
  id: "1",
  title: "Existing title",
  type: "動畫",
  status: "進行中",
  year: 2024,
  episodes: [],
  rating: 8.5,
  review: "Initial review",
  note: "Initial note",
  source: "Manual",
  reminder_enabled: false,
  tags: [],
  date_added: "2024-01-01",
};

const defaultProps = {
  work: mockWork,
  onSave: jest.fn(),
  onCancel: jest.fn(),
  isOpen: true,
  inline: true,
};

describe("WorkEditForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form copy from the edit form translation namespace", () => {
    render(<WorkEditForm {...defaultProps} />);

    expect(screen.getByText("WorkEditForm.labels.title")).toBeInTheDocument();
    expect(screen.getByText("WorkEditForm.labels.rating")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "WorkEditForm.buttons.save" })
    ).toBeInTheDocument();
  });

  it("preserves decimal ratings when saving", () => {
    render(<WorkEditForm {...defaultProps} />);

    fireEvent.click(
      screen.getByRole("button", { name: "WorkEditForm.buttons.save" })
    );

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 8.5 })
    );
  });

  it("allows editing ratings with half-point precision", () => {
    render(<WorkEditForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText("WorkEditForm.ratingInputLabel"), {
      target: { value: "9.5" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "WorkEditForm.buttons.save" })
    );

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 9.5 })
    );
  });

  it("disables save and cancel actions while saving", () => {
    const SavingWorkEditForm = WorkEditForm as React.ComponentType<any>;

    render(<SavingWorkEditForm {...defaultProps} isSaving />);

    expect(
      screen.getByRole("button", { name: "WorkEditForm.buttons.saving" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "WorkEditForm.buttons.cancel" })
    ).toBeDisabled();
  });
});
