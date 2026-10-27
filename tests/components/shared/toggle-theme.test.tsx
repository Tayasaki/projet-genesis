import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToggleTheme } from "@/components/features/theme/ToggleTheme";

const setTheme = vi.fn();
let currentTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme }),
}));

describe("ToggleTheme", () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it("is reachable by its screen-reader name", () => {
    render(<ToggleTheme />);

    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("switches light to dark", async () => {
    currentTheme = "light";
    render(<ToggleTheme />);

    await userEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches dark to light", async () => {
    currentTheme = "dark";
    render(<ToggleTheme />);

    await userEvent.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
