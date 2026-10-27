import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

function Example({
  onValueChange,
  disabled,
}: {
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger aria-label="Fruit">
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="pear">Pear</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("renders the placeholder and keeps options closed", () => {
    render(<Example />);

    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent(
      "Pick a fruit",
    );
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("opens on click and selects an option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", { name: "Fruit" }));
    expect(screen.getAllByRole("option")).toHaveLength(2);

    await user.click(screen.getByRole("option", { name: "Pear" }));

    expect(onValueChange).toHaveBeenCalledWith("pear");
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent(
      "Pear",
    );
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation and Escape", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    screen.getByRole("combobox", { name: "Fruit" }).focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("pear");

    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Example disabled />);

    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
