import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
  assign: vi.fn(),
  session: { data: { user: { id: "user-1" } } } as {
    data: { user: { id: string } } | null;
  },
}));

vi.mock("@/src/actions/account.action", () => ({
  deleteAccount: h.deleteAccount,
}));
vi.mock("@/lib/auth-client", () => ({
  signOut: h.signOut,
  useSession: () => h.session,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { DeleteAccountButton } from "@/components/features/layout/auth/LogoutButton";

async function openDialog() {
  render(<DeleteAccountButton />);
  await userEvent.click(
    screen.getByRole("button", { name: "Supprimer mon compte" }),
  );
  return screen.findByRole("alertdialog");
}

async function confirmOpenDialog() {
  const dialog = await screen.findByRole("alertdialog");
  const button = Array.from(dialog.querySelectorAll("button")).find(
    (b) => b.textContent === "Supprimer mon compte",
  ) as HTMLButtonElement;
  await userEvent.click(button);
  return button;
}

async function confirm() {
  await openDialog();
  return confirmOpenDialog();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("location", { assign: h.assign });
  h.session = { data: { user: { id: "user-1" } } };
  h.deleteAccount.mockResolvedValue({ data: undefined });
  h.signOut.mockResolvedValue({ data: { success: true }, error: null });
});

describe("DeleteAccountButton", () => {
  it("deletes nothing before the dialog is confirmed", async () => {
    await openDialog();

    expect(h.deleteAccount).not.toHaveBeenCalled();
    expect(h.signOut).not.toHaveBeenCalled();
  });

  it("does nothing when cancelled", async () => {
    await openDialog();

    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(h.deleteAccount).not.toHaveBeenCalled();
    expect(h.signOut).not.toHaveBeenCalled();
    expect(h.assign).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("erases the account with the session user id, then signs out and hard-navigates to /login", async () => {
    await confirm();

    await waitFor(() => expect(h.assign).toHaveBeenCalledWith("/login"));
    expect(h.deleteAccount).toHaveBeenCalledTimes(1);
    expect(h.deleteAccount).toHaveBeenCalledWith({ sessionId: "user-1" });
    expect(h.signOut).toHaveBeenCalledTimes(1);
    expect(h.deleteAccount.mock.invocationCallOrder[0]).toBeLessThan(
      h.signOut.mock.invocationCallOrder[0],
    );
    expect(h.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      h.assign.mock.invocationCallOrder[0],
    );
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still redirects when sign-out itself fails, since the account is gone", async () => {
    h.signOut.mockRejectedValueOnce(new Error("network"));

    await confirm();

    await waitFor(() => expect(h.assign).toHaveBeenCalledWith("/login"));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    ["a server error", { serverError: "boom" }],
    ["validation errors", { validationErrors: { sessionId: ["bad"] } }],
  ])("shows an error and stays signed in on %s", async (_label, result) => {
    h.deleteAccount.mockResolvedValue(result);

    await confirm();

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith(
      "La suppression du compte a échoué. Votre compte n'a pas été supprimé.",
    );
    expect(h.signOut).not.toHaveBeenCalled();
    expect(h.assign).not.toHaveBeenCalled();
  });

  it("shows an error and stays signed in when the call rejects", async () => {
    h.deleteAccount.mockRejectedValue(new Error("network"));

    await confirm();

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(h.signOut).not.toHaveBeenCalled();
    expect(h.assign).not.toHaveBeenCalled();
  });

  it("can be retried after a failure", async () => {
    h.deleteAccount.mockResolvedValueOnce({ serverError: "boom" });
    await confirm();
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));

    await userEvent.click(
      screen.getByRole("button", { name: "Supprimer mon compte" }),
    );
    await confirmOpenDialog();

    await waitFor(() => expect(h.assign).toHaveBeenCalledWith("/login"));
    expect(h.deleteAccount).toHaveBeenCalledTimes(2);
  });

  it("calls the action once when the confirm button is clicked twice", async () => {
    let release: (v: unknown) => void = () => {};
    h.deleteAccount.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    const button = await confirm();

    await userEvent.click(button);
    await userEvent.click(button);

    expect(h.deleteAccount).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    release({ data: undefined });
    await waitFor(() => expect(h.assign).toHaveBeenCalledTimes(1));
    expect(h.signOut).toHaveBeenCalledTimes(1);
  });

  it("does not call the action without a session user id", async () => {
    h.session = { data: null };

    const button = await confirm();

    expect(button).toBeDisabled();
    expect(h.deleteAccount).not.toHaveBeenCalled();
  });

  it("calls the action once for two confirm events fired in the same tick", async () => {
    let release: (v: unknown) => void = () => {};
    h.deleteAccount.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    await openDialog();
    const dialog = await screen.findByRole("alertdialog");
    const button = Array.from(dialog.querySelectorAll("button")).find(
      (b) => b.textContent === "Supprimer mon compte",
    ) as HTMLButtonElement;

    // Both clicks land before React can re-render the disabled state.
    act(() => {
      button.click();
      button.click();
    });

    expect(h.deleteAccount).toHaveBeenCalledTimes(1);
    release({ data: undefined });
    await waitFor(() => expect(h.assign).toHaveBeenCalledTimes(1));
  });

  it("keeps the dialog open while the erasure is pending", async () => {
    let release: (v: unknown) => void = () => {};
    h.deleteAccount.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    await confirm();

    expect(h.deleteAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annuler" })).toBeDisabled();

    release({ data: undefined });
    await waitFor(() => expect(h.assign).toHaveBeenCalledTimes(1));
  });

  it("states what is erased, that it is irreversible, and that suggestions are kept", async () => {
    const dialog = await openDialog();

    expect(dialog).toHaveTextContent("irréversible");
    for (const word of [
      "compte",
      "sessions",
      "scénarios",
      "personnages",
      "armes",
    ]) {
      expect(dialog).toHaveTextContent(word);
    }
    expect(dialog).toHaveTextContent(
      "suggestions que vous avez déjà soumises sont conservées de façon anonyme",
    );
  });

  it("focuses Cancel, not the destructive action, when the dialog opens", async () => {
    await openDialog();

    expect(screen.getByRole("button", { name: "Annuler" })).toHaveFocus();
  });
});
