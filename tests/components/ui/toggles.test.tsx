import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";

describe("Checkbox", () => {
  it("toggles checked state on click and reports it", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />,
    );

    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).not.toBeChecked();

    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(box);
    expect(box).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles with the Space key", async () => {
    render(<Checkbox aria-label="Accept" />);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(screen.getByRole("checkbox", { name: "Accept" })).toBeChecked();
  });

  it("cannot be toggled when disabled", async () => {
    render(<Checkbox aria-label="Accept" disabled />);

    const box = screen.getByRole("checkbox", { name: "Accept" });
    await userEvent.click(box);

    expect(box).toBeDisabled();
    expect(box).not.toBeChecked();
  });
});

describe("Switch", () => {
  it("flips between unchecked and checked", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Dark mode" onCheckedChange={onCheckedChange} />);

    const sw = screen.getByRole("switch", { name: "Dark mode" });
    expect(sw).toHaveAttribute("aria-checked", "false");

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("honours defaultChecked and disabled", async () => {
    render(<Switch aria-label="Locked" defaultChecked disabled />);

    const sw = screen.getByRole("switch", { name: "Locked" });
    await userEvent.click(sw);

    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toBeDisabled();
  });
});

describe("Toggle", () => {
  it("toggles its pressed state", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);

    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
});
