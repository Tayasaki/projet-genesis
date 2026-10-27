import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>Popover body</PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("is closed initially", () => {
    render(<Example />);

    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open popover" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles open and closed on trigger click", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Open popover" });

    await user.click(trigger);
    expect(screen.getByText("Popover body")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Open popover" }));
    expect(screen.getByText("Popover body")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
  });
});
