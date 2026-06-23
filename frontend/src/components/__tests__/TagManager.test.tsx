import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TagManager from "../TagManager";
import { Tag } from "@/types";

const mockTranslations: Record<string, string> = {
  "TagManager.title": "Tag management",
  "TagManager.stats": "{count} tags created",
  "TagManager.labels.name": "Tag name",
  "TagManager.labels.color": "Color",
  "TagManager.placeholders.name": "Enter tag name",
  "TagManager.buttons.add": "Add tag",
  "TagManager.buttons.confirmAdd": "Add",
  "TagManager.buttons.update": "Update",
  "TagManager.buttons.cancel": "Cancel",
  "TagManager.buttons.edit": "Edit {name}",
  "TagManager.buttons.delete": "Delete {name}",
  "TagManager.deleteDialog.title": "Delete tag",
  "TagManager.deleteDialog.description": "This will permanently delete \"{name}\" from the tag list.",
  "TagManager.deleteDialog.confirm": "Confirm delete",
  "TagManager.empty": "No tags yet. Add your first tag to start organizing works.",
  "TagManager.errors.duplicate": "A tag with this name already exists.",
  "TagManager.colorSwatch": "{name} color",
  "TagManager.selectedColor": "Selected color",
};

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const template = mockTranslations[`${namespace}.${key}`] ?? `${namespace}.${key}`;

      return Object.entries(values ?? {}).reduce(
        (message, [name, value]) =>
          message.replace(new RegExp(`{${name}}`, "g"), String(value)),
        template
      );
    },
}));

const tags: Tag[] = [
  { id: 1, name: "Anime", color: "#3B82F6" },
  { id: 2, name: "Movie", color: "#EF4444" },
];

describe("TagManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows duplicate add errors inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const onTagsChange = jest.fn();

    render(<TagManager tags={tags} onTagsChange={onTagsChange} />);

    await user.click(screen.getByRole("button", { name: "Add tag" }));
    await user.type(screen.getByLabelText("Tag name"), "anime");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A tag with this name already exists."
    );
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it("shows duplicate edit errors inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const onTagsChange = jest.fn();

    render(<TagManager tags={tags} onTagsChange={onTagsChange} />);

    await user.click(screen.getByRole("button", { name: "Edit Movie" }));
    const nameInput = screen.getByDisplayValue("Movie");
    await user.clear(nameInput);
    await user.type(nameInput, "Anime");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A tag with this name already exists."
    );
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it("renders visible color swatches for existing tags", () => {
    render(<TagManager tags={tags} onTagsChange={jest.fn()} />);

    expect(screen.getByLabelText("Anime color")).toHaveStyle({
      backgroundColor: "#3B82F6",
    });
    expect(screen.getByLabelText("Movie color")).toHaveStyle({
      backgroundColor: "#EF4444",
    });
  });

  it("confirms tag deletion with an inline dialog", async () => {
    const user = userEvent.setup();
    const onTagsChange = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<TagManager tags={tags} onTagsChange={onTagsChange} />);

    await user.click(screen.getByRole("button", { name: "Delete Anime" }));

    expect(
      await screen.findByRole("alertdialog", { name: "Delete tag" })
    ).toBeInTheDocument();
    expect(
      screen.getByText('This will permanently delete "Anime" from the tag list.')
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onTagsChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onTagsChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete Anime" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(onTagsChange).toHaveBeenCalledWith([tags[1]]);
    confirmSpy.mockRestore();
  });
});
