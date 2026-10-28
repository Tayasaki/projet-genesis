import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
  replace: vi.fn(),
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
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: h.replace }),
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
    expect(h.replace).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("erases the account with the session user id, then signs out and redirects", async () => {
    await confirm();

    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/login"));
    expect(h.deleteAccount).toHaveBeenCalledTimes(1);
    expect(h.deleteAccount).toHaveBeenCalledWith({ sessionId: "user-1" });
    expect(h.signOut).toHaveBeenCalledTimes(1);
    expect(h.deleteAccount.mock.invocationCallOrder[0]).toBeLessThan(
      h.signOut.mock.invocationCallOrder[0],
    );
    expect(h.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      h.replace.mock.invocationCallOrder[0],
    );
    expect(toast.success).toHaveBeenCalledWith("Votre compte a été supprimé.");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still redirects when sign-out itself fails, since the account is gone", async () => {
    h.signOut.mockRejectedValueOnce(new Error("network"));

    await confirm();

    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/login"));
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
    expect(h.replace).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows an error and stays signed in when the call rejects", async () => {
    h.deleteAccount.mockRejectedValue(new Error("network"));

    await confirm();

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(h.signOut).not.toHaveBeenCalled();
    expect(h.replace).not.toHaveBeenCalled();
  });

  it("can be retried after a failure", async () => {
    h.deleteAccount.mockResolvedValueOnce({ serverError: "boom" });
    await confirm();
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));

    await userEvent.click(
      screen.getByRole("button", { name: "Supprimer mon compte" }),
    );
    await confirmOpenDialog();

    await waitFor(() => expect(h.replace).toHaveBeenCalledWith("/login"));
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
    await waitFor(() => expect(h.replace).toHaveBeenCalledTimes(1));
    expect(h.signOut).toHaveBeenCalledTimes(1);
  });

  it("does not call the action without a session user id", async () => {
    h.session = { data: null };

    const button = await confirm();

    expect(button).toBeDisabled();
    expect(h.deleteAccount).not.toHaveBeenCalled();
  });
});
