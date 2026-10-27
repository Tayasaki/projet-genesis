import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Values = { name: string };

function NameForm({ onValid }: { onValid: (v: Values) => void }) {
  const form = useForm<Values>({ defaultValues: { name: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValid)}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Your display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  it("links the label and description to the control", () => {
    render(<NameForm onValid={vi.fn()} />);

    const input = screen.getByLabelText("Name");
    expect(input).toHaveAccessibleDescription("Your display name.");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("shows the validation message and blocks submit when invalid", async () => {
    const onValid = vi.fn();
    render(<NameForm onValid={onValid} />);

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(onValid).not.toHaveBeenCalled();
  });

  it("submits the typed values when valid", async () => {
    const onValid = vi.fn();
    render(<NameForm onValid={onValid} />);

    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    await vi.waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0][0]).toEqual({ name: "Ada" });
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });
});
