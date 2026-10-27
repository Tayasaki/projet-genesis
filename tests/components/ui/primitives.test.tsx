import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code } from "@/components/ui/code";
import { Loader } from "@/components/ui/loader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RandomButton } from "@/components/ui/randomButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

describe("Card", () => {
  it("renders header, content and footer text", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    for (const text of ["Desc", "Body", "Foot"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });
});

describe("Alert", () => {
  it("has the alert role with title and description", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Oops</AlertTitle>
        <AlertDescription>Something failed</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Oops");
    expect(alert).toHaveTextContent("Something failed");
  });
});

describe("Accordion", () => {
  function Example() {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  it("expands and collapses its content on trigger click", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Question" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Answer")).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Answer")).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Avatar", () => {
  it("shows the fallback when no image loads", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("AB")).toBeInTheDocument();
  });
});

describe("Skeleton, Separator, Loader, Code", () => {
  it("Skeleton renders and forwards props", () => {
    render(<Skeleton data-testid="sk" className="h-4" />);

    expect(screen.getByTestId("sk")).toHaveClass("h-4");
  });

  it("Separator is decorative by default and horizontal", () => {
    render(<Separator data-testid="sep" />);

    const sep = screen.getByTestId("sep");
    expect(sep).toHaveAttribute("role", "none");
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
  });

  it("Separator exposes the separator role when not decorative", () => {
    render(<Separator decorative={false} orientation="vertical" />);

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("Loader renders an svg with the given size and class", () => {
    const { container } = render(<Loader size={32} className="extra" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveClass("animate-spin", "extra");
  });

  it("Code renders its text with merged classes", () => {
    render(<Code className="mine">npm i</Code>);

    expect(screen.getByText("npm i")).toHaveClass("font-mono", "mine");
  });
});

describe("RadioGroup", () => {
  function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
      <RadioGroup defaultValue="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>
    );
  }

  it("selects the default and moves selection on click", async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    expect(screen.getByRole("radio", { name: "Option A" })).toBeChecked();

    await userEvent.click(screen.getByRole("radio", { name: "Option B" }));

    expect(screen.getByRole("radio", { name: "Option B" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Option A" })).not.toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("moves selection with the arrow keys", async () => {
    render(<Example />);

    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Option A" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");

    const b = screen.getByRole("radio", { name: "Option B" });
    expect(b).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(b).toBeChecked();
    expect(screen.getByRole("radio", { name: "Option A" })).not.toBeChecked();
  });
});

describe("ScrollArea", () => {
  it("renders its children", () => {
    render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );

    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
  });
});

describe("RandomButton", () => {
  it("calls randomize on each click", async () => {
    const randomize = vi.fn();
    render(<RandomButton randomize={randomize} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    await userEvent.click(button);

    expect(randomize).toHaveBeenCalledTimes(2);
  });
});
