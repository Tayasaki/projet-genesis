import fs from "node:fs";
import path from "node:path";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { CharacterAttributes } from "@/app/(app)/manage/page";

const PAGE_SOURCE = fs.readFileSync(
  path.resolve(__dirname, "../../../app/(app)/manage/page.tsx"),
  "utf8",
);

const NOT_AUTHORIZED = "Vous n'êtes pas autorisé à supprimer ce type d'attribut";

/** Attribute types `page.tsx` feeds into the given table's data array. */
function typesAssignedByPage(pageKey: string): string[] {
  const pushes = PAGE_SOURCE.matchAll(
    /(characterAttributes|weaponAttributes)\.push\(\s*\{[^}]*type:\s*"(\w+)"/g,
  );
  return [...pushes].filter((m) => m[1] === pageKey).map((m) => m[2]);
}

type SuiteOptions = {
  name: string;
  Table: React.ComponentType<{ data: CharacterAttributes[]; title: string }>;
  pageKey: "characterAttributes" | "weaponAttributes";
  /** Hard-coded expectation: attribute type -> the delete action it must call. */
  mocks: Record<string, Mock>;
  /** Hard-coded expectation: attribute type -> label shown in the type column. */
  labels: Record<string, string>;
  expectedPageTypeCount: number;
};

export function describeAttributeDelete({
  name,
  Table,
  pageKey,
  mocks,
  labels,
  expectedPageTypeCount,
}: SuiteOptions) {
  const types = Object.keys(mocks);
  const rowName = (type: string) => `${type}-attr`;

  function renderRow(type: string) {
    render(
      <Table
        title={name}
        data={[{ id: "1", name: rowName(type), type, description: null }]}
      />,
    );
  }

  async function openDialog(type: string) {
    renderRow(type);
    await userEvent.click(
      screen.getByRole("button", { name: `Supprimer ${rowName(type)}` }),
    );
    return within(await screen.findByRole("alertdialog"));
  }

  async function confirm(type: string) {
    const dialog = await openDialog(type);
    await userEvent.click(dialog.getByRole("button", { name: "Supprimer" }));
  }

  function totalCalls() {
    return Object.values(mocks).reduce((n, m) => n + m.mock.calls.length, 0);
  }

  describe(name, () => {
    beforeEach(() => {
      vi.clearAllMocks();
      Object.values(mocks).forEach((m) => m.mockResolvedValue(undefined));
    });

    it.each(types)(
      "confirming a %s row calls only its own delete action, with the name",
      async (type) => {
        await confirm(type);

        await waitFor(() => expect(mocks[type]).toHaveBeenCalledTimes(1));
        expect(mocks[type]).toHaveBeenCalledWith({ name: rowName(type) });
        expect(totalCalls()).toBe(1);
        expect(toast.error).not.toHaveBeenCalled();
      },
    );

    it.each(types)("cancelling a %s row deletes nothing", async (type) => {
      const dialog = await openDialog(type);
      await userEvent.click(dialog.getByRole("button", { name: "Annuler" }));

      expect(totalCalls()).toBe(0);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it.each(types)("shows the type label for a %s row", (type) => {
      renderRow(type);

      const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
      expect(cells[0]).toHaveTextContent(labels[type]);
    });

    it.each([
      ["serverError", { serverError: "boom" }],
      ["validationErrors", { validationErrors: { name: ["bad"] } }],
    ])(
      "toasts an error when the action returns %s",
      async (_kind, failure) => {
        const type = types[0];
        mocks[type].mockResolvedValue(failure);

        await confirm(type);

        await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
        expect(toast.error).toHaveBeenCalledWith(NOT_AUTHORIZED);
      },
    );

    describe("page.tsx completeness", () => {
      const pageTypes = typesAssignedByPage(pageKey);

      it("finds every attribute type the page assigns to this table", () => {
        expect(pageTypes).toHaveLength(expectedPageTypeCount);
      });

      it("has a dispatch entry for exactly the types the page assigns", () => {
        expect([...pageTypes].sort()).toEqual([...types].sort());
      });

      it.each(pageTypes)(
        "page type %s reaches a delete action instead of a silent no-op",
        async (type) => {
          await confirm(type);

          await waitFor(() => expect(totalCalls()).toBe(1));
        },
      );
    });
  });
}
