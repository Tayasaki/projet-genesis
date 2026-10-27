import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

function Example({ onEdit }: { onEdit?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("keeps the menu closed until triggered", () => {
    render(<Example />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens, runs an item's handler and closes", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Example onEdit={onEdit} />);

    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("navigates with the keyboard and closes on Escape", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Example onEdit={onEdit} />);

    screen.getByRole("button", { name: "Actions" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onEdit).toHaveBeenCalledTimes(1);

    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks disabled items and does not close on them", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Actions" }));
    const item = screen.getByRole("menuitem", { name: "Delete" });

    expect(item).toHaveAttribute("aria-disabled", "true");
    await user.click(item);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
