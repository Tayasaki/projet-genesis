import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

describe("Tooltip", () => {
  function Example() {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipContent>Helpful hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  it("renders the trigger without the content", () => {
    render(<Example />);

    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on hover and hides on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Help" });

    await user.hover(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Helpful hint",
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows on keyboard focus and hides on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});

describe("HoverCard", () => {
  function Example() {
    return (
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCardTrigger href="#profile">@jane</HoverCardTrigger>
        <HoverCardContent>Profile of Jane</HoverCardContent>
      </HoverCard>
    );
  }

  it("renders the trigger with the card closed", () => {
    render(<Example />);

    expect(screen.getByRole("link", { name: "@jane" })).toBeInTheDocument();
    expect(screen.queryByText("Profile of Jane")).not.toBeInTheDocument();
  });

  it("opens on hover and closes on unhover", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("link", { name: "@jane" });

    await user.hover(trigger);
    expect(await screen.findByText("Profile of Jane")).toBeInTheDocument();

    await user.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByText("Profile of Jane")).not.toBeInTheDocument(),
    );
  });
});
