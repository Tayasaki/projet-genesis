import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

// Fixed month so day buttons are deterministic regardless of the real date.
const JUNE_2024 = new Date(2024, 5, 1);

describe("Calendar", () => {
  it("renders the month with its caption and day grid", () => {
    render(<Calendar mode="single" defaultMonth={JUNE_2024} />);

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("June 2024")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThanOrEqual(30);
  });

  it("calls onSelect with the clicked day", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar mode="single" defaultMonth={JUNE_2024} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("button", { name: /June 15th, 2024/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0][0] as Date;
    expect([
      picked.getFullYear(),
      picked.getMonth(),
      picked.getDate(),
    ]).toEqual([2024, 5, 15]);
  });

  it("navigates to the next month", async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" defaultMonth={JUNE_2024} />);

    await user.click(screen.getByRole("button", { name: /next month/i }));

    expect(screen.getByText("July 2024")).toBeInTheDocument();
  });

  it("does not select a disabled day", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        defaultMonth={JUNE_2024}
        onSelect={onSelect}
        disabled={{ before: new Date(2024, 5, 10) }}
      />,
    );

    const day = screen.getByRole("button", { name: /June 5th, 2024/ });
    expect(day).toBeDisabled();
    await user.click(day);

    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("DatePicker", () => {
  // DatePicker's Calendar opens on the current month, so pin "today" (Date
  // only; timers stay real so user-event keeps working) and always restore.
  afterEach(() => {
    vi.useRealTimers();
  });

  function freezeToJune2024() {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2024, 5, 10, 12));
  }

  it("shows the placeholder when no date is set", () => {
    render(<DatePicker setDate={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /pick a date/i }),
    ).toBeInTheDocument();
  });

  it("shows the formatted date when a value is provided", () => {
    render(<DatePicker date={new Date(2024, 5, 15)} setDate={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /June 15th, 2024/ }),
    ).toBeInTheDocument();
  });

  it("opens the calendar and reports the picked day via setDate", async () => {
    freezeToJune2024();
    const user = userEvent.setup();
    const setDate = vi.fn();
    render(<DatePicker date={new Date(2024, 5, 15)} setDate={setDate} />);

    await user.click(screen.getByRole("button", { name: /June 15th, 2024/ }));
    expect(screen.getByRole("grid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /June 20th, 2024/ }));

    expect(setDate).toHaveBeenCalledTimes(1);
    const picked = setDate.mock.calls[0][0] as Date;
    expect([
      picked.getFullYear(),
      picked.getMonth(),
      picked.getDate(),
    ]).toEqual([2024, 5, 20]);
  });
});
