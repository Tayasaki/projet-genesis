import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";

async function openDialog(deleteItem = vi.fn()) {
  render(<DeleteDialog item="Épée" deleteItem={deleteItem} />);
  await userEvent.click(screen.getByRole("button"));
  await screen.findByRole("alertdialog");
  return deleteItem;
}

describe("DeleteDialog", () => {
  it("is closed initially and names the item once opened", async () => {
    render(<DeleteDialog item="Épée" deleteItem={vi.fn()} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    expect(await screen.findByRole("alertdialog")).toHaveTextContent("Épée");
  });

  it("does not delete when cancelled", async () => {
    const deleteItem = await openDialog();

    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(deleteItem).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deletes once when confirmed", async () => {
    const deleteItem = await openDialog();

    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(deleteItem).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
