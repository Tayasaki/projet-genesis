import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

describe("Input", () => {
  it("is found by its placeholder and reports typed text", async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Name" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Name");
    await userEvent.type(input, "Ada");

    expect(input).toHaveValue("Ada");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("applies the type attribute", () => {
    render(<Input type="email" aria-label="Email" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("ignores typing when disabled", async () => {
    render(<Input disabled aria-label="Locked" />);

    const input = screen.getByLabelText("Locked");
    await userEvent.type(input, "x");

    expect(input).toBeDisabled();
    expect(input).toHaveValue("");
  });
});

describe("Textarea", () => {
  it("accepts multi-line text", async () => {
    render(<Textarea aria-label="Notes" />);

    const area = screen.getByRole("textbox", { name: "Notes" });
    await userEvent.type(area, "a{Enter}b");

    expect(area).toHaveValue("a\nb");
  });

  it("ignores typing when disabled", async () => {
    render(<Textarea disabled aria-label="Notes" />);

    await userEvent.type(screen.getByLabelText("Notes"), "x");

    expect(screen.getByLabelText("Notes")).toHaveValue("");
  });
});
