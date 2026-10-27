import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { requiredString } from "@/components/form/required-string";
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

  describe("zod 4 field kinds", () => {
    function setup<S extends z.ZodObject<z.ZodRawShape>>(
      formSchema: S,
      props: { onSubmit?: (v: z.infer<S>) => void } = {},
    ) {
      const onSubmit = props.onSubmit ?? vi.fn();
      render(
        <AutoForm formSchema={formSchema} onSubmit={onSubmit}>
          <AutoFormSubmit isLoading={false}>Save</AutoFormSubmit>
        </AutoForm>,
      );
      return onSubmit as ReturnType<typeof vi.fn>;
    }

    it("renders an enum as a select listing every option and submits the chosen one", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({ role: z.enum(["warrior", "mage", "rogue"]) }),
      );

      const trigger = screen.getByRole("combobox");
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      await user.click(trigger);
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
        "warrior",
        "mage",
        "rogue",
      ]);

      await user.click(screen.getByRole("option", { name: "mage" }));
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ role: "mage" });
    });

    it("renders an optional enum as a select too", () => {
      setup(z.object({ ammo: z.enum(["arrow", "bolt"]).optional() }));

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders a number as a spinbutton and submits a number", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(z.object({ age: z.number().min(1).max(120) }));

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("min", "1");
      expect(input).toHaveAttribute("max", "120");
      await user.type(input, "42");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ age: 42 });
    });

    it("shows a placeholder, then a validation error, for an unselected required enum", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({
          role: z.enum(["warrior", "mage"], "Veuillez choisir une valeur"),
        }),
      );

      expect(screen.getByRole("combobox")).toHaveTextContent(
        "Sélectionner une option",
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Veuillez choisir une valeur"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("uses the configured placeholder on an unselected enum", () => {
      render(
        <AutoForm
          formSchema={z.object({ role: z.enum(["warrior", "mage"]) })}
          fieldConfig={{ role: { inputProps: { placeholder: "Choisir..." } } }}
        />,
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("Choisir...");
    });

    it("keeps validation errors and typed values visible after a blocked submit", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({
          title: z.string().min(5, "Title too short"),
          role: z.enum(["warrior", "mage"], "Veuillez choisir une valeur"),
        }),
      );

      await user.type(screen.getByLabelText(/title/i), "abc");
      await user.click(screen.getByRole("button", { name: "Save" }));
      await screen.findByText("Title too short");
      await new Promise((r) => setTimeout(r, 50));

      expect(screen.getByText("Title too short")).toBeInTheDocument();
      expect(
        screen.getByText("Veuillez choisir une valeur"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue("abc");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("resets the fields after a successful submit", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(z.object({ title: z.string().min(1) }));

      await user.type(screen.getByLabelText(/title/i), "Hello");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ title: "Hello" }),
      );
      await waitFor(() =>
        expect(screen.getByLabelText(/title/i)).toHaveValue(""),
      );
    });

    it("fails an empty required number instead of coercing it to 0", async () => {
      const user = userEvent.setup();
      // 0 is a valid number here: only "empty -> undefined" can fail it.
      const onSubmit = setup(
        z.object({ age: z.number({ error: "Nombre requis" }) }),
      );

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByText("Nombre requis")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("accepts an empty optional number and omits it from the payload", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({ title: z.string(), age: z.number().optional() }),
      );

      await user.type(screen.getByLabelText(/title/i), "x");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ title: "x" });
    });

    it("clearing a typed number makes a required number fail again", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({ age: z.number({ error: "Nombre requis" }) }),
      );

      const input = screen.getByRole("spinbutton");
      await user.type(input, "5");
      await user.clear(input);
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(await screen.findByText("Nombre requis")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("blocks an emptied required name with the French message and keeps the description", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({
          name: requiredString(50).describe("Nom"),
          description: z.string().max(200).describe("Description").optional(),
        }),
      );

      await user.type(screen.getByLabelText(/^nom/i), "Loyal");
      await user.clear(screen.getByLabelText(/^nom/i));
      await user.type(screen.getByLabelText(/description/i), "Un texte");
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Ce champ est requis"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/description/i)).toHaveValue("Un texte");
    });

    it("shows the French message for a required string that was never touched", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(z.object({ name: requiredString(50) }));

      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(
        await screen.findByText("Ce champ est requis"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("renders a date as a date picker and submits a Date", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(z.object({ when: z.date() }));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /pick a date/i }));
      const days = await screen.findAllByRole("gridcell");
      await user.click(
        within(
          days.find((d) => d.textContent === "15") as HTMLElement,
        ).getByRole("button"),
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      const submitted = onSubmit.mock.calls[0][0].when;
      expect(submitted).toBeInstanceOf(Date);
      expect(submitted.getDate()).toBe(15);
    });

    it("renders a boolean as a checkbox and submits a boolean", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(z.object({ melee: z.boolean() }));

      const checkbox = screen.getByRole("checkbox");
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ melee: true });
    });

    it("prefills from .default() through optional wrappers", () => {
      setup(
        z.object({
          melee: z.boolean().default(true).optional(),
          name: z.string().default("Excalibur"),
          power: z.number().default(7).optional(),
        }),
      );

      expect(screen.getByRole("checkbox")).toBeChecked();
      expect(screen.getByRole("textbox")).toHaveValue("Excalibur");
      expect(screen.getByRole("spinbutton")).toHaveValue(7);
    });

    it("prefills a defaulted enum with its default option", () => {
      setup(z.object({ range: z.enum(["short", "long"]).default("long") }));

      expect(screen.getByRole("combobox")).toHaveTextContent("long");
    });

    it("keeps the .describe() label through .optional() wrappers", () => {
      setup(
        z.object({
          ammo: z.enum(["arrow"]).describe("Munition de l'arme").optional(),
        }),
      );

      expect(screen.getByText("Munition de l'arme")).toBeInTheDocument();
    });

    it("marks required and optional fields differently and submits without the optional one", async () => {
      const user = userEvent.setup();
      const onSubmit = setup(
        z.object({
          title: z.string().min(1, "Title is required"),
          note: z.string().optional(),
        }),
      );

      expect(screen.getByLabelText(/title/i)).toBeRequired();
      expect(screen.getByLabelText(/note/i)).not.toBeRequired();
      await user.type(screen.getByLabelText(/title/i), "Hello");
      await user.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit).toHaveBeenCalledWith({ title: "Hello" });
    });

    it("renders nested objects and arrays of objects with typed fields", async () => {
      const user = userEvent.setup();
      setup(
        z.object({
          stats: z.object({ level: z.number() }),
          skills: z
            .array(z.object({ name: z.enum(["swim", "climb"]).optional() }))
            .describe("Skills"),
        }),
      );

      await user.click(screen.getByRole("button", { name: /stats/i }));
      expect(await screen.findByRole("spinbutton")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /skills/i }));
      await user.click(screen.getByRole("button", { name: /add/i }));
      expect(await screen.findByRole("combobox")).toBeInTheDocument();
    });

    it("keeps detecting field kinds on a refined object schema", () => {
      setup(
        z
          .object({ a: z.number(), b: z.enum(["x", "y"]) })
          .refine((v) => v.a > 0, "a must be positive") as never,
      );

      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders the element fields of an optional array of objects", async () => {
      const user = userEvent.setup();
      setup(
        z.object({
          tags: z
            .array(z.object({ name: z.enum(["a", "b"]).optional() }))
            .describe("Tags")
            .optional(),
        }),
      );

      await user.click(screen.getByRole("button", { name: /tags/i }));
      await user.click(screen.getByRole("button", { name: /add/i }));
      expect(await screen.findByRole("combobox")).toBeInTheDocument();
    });

    it("renders typed fields for an object schema piped through transform()", () => {
      setup(
        z
          .object({ a: z.number(), b: z.enum(["x", "y"]) })
          .transform((v) => ({ ...v, sum: v.a })) as never,
      );

      expect(screen.getByRole("spinbutton")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("applies maxlength and drops required for a nullable string", () => {
      setup(z.object({ code: z.string().min(2).max(5).nullable() }));

      const input = screen.getByLabelText(/code/i);
      expect(input).toHaveAttribute("minlength", "2");
      expect(input).toHaveAttribute("maxlength", "5");
      expect(input).not.toBeRequired();
    });

    it("prefills defaults declared inside a nested object", async () => {
      const user = userEvent.setup();
      setup(
        z.object({
          stats: z.object({ level: z.number().default(3) }),
        }),
      );

      await user.click(screen.getByRole("button", { name: /stats/i }));
      expect(await screen.findByRole("spinbutton")).toHaveValue(3);
    });

    it("renders the weapon-form schema shape with typed fields", () => {
      setup(
        z.object({
          name: z.string().max(50).describe("Nom de l'arme"),
          melee: z.boolean().describe("Arme de mélée").default(true).optional(),
          description: z.string().max(200).describe("Description").optional(),
          ammo: z.enum(["a1", "a2"]).describe("Munition").optional(),
          weight: z.enum(["light", "heavy"]).describe("Poids"),
          range: z.enum(["near", "far"]).describe("Portée"),
          damage: z.enum(["low", "high"]).describe("Dégât"),
        }),
      );

      expect(screen.getAllByRole("combobox")).toHaveLength(4);
      expect(screen.getByRole("checkbox")).toBeChecked();
      expect(screen.getByText("Arme de mélée")).toBeInTheDocument();
    });
  });
});
