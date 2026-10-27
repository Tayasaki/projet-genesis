import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { installRadixJsdomStubs } from "../../../helpers/radix-jsdom";

installRadixJsdomStubs();

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
});

function renderForm(onSubmit = vi.fn()) {
  render(
    <AutoForm formSchema={schema} onSubmit={onSubmit}>
      <AutoFormSubmit isLoading={false}>Save</AutoFormSubmit>
    </AutoForm>,
  );
  return onSubmit;
}

describe("AutoForm", () => {
  it("renders one labelled field per schema key and a submit button", () => {
    renderForm();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows validation errors and does not submit invalid values", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText(/username/i), "ab");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Username must be at least 3 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed values when the input is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.type(screen.getByLabelText(/username/i), "jane");
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      username: "jane",
      email: "jane@example.com",
    });
  });

  it("reports value changes through onValuesChange", async () => {
    const user = userEvent.setup();
    const onValuesChange = vi.fn();
    render(<AutoForm formSchema={schema} onValuesChange={onValuesChange} />);

    await user.type(screen.getByLabelText(/username/i), "jo");

    expect(onValuesChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ username: "jo" }),
    );
  });
});
