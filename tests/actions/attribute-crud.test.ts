import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createNameAttribute,
  deleteNameAttribute,
} from "@/src/actions/attribute-crud";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function makeDelegate() {
  return {
    create: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  };
}

describe("attribute-crud", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createNameAttribute passes {name, description} as data and revalidates /manage", async () => {
    const delegate = makeDelegate();

    await createNameAttribute(delegate, {
      name: "Loyal",
      description: "Never betrays",
    });

    expect(delegate.create).toHaveBeenCalledTimes(1);
    expect(delegate.create).toHaveBeenCalledWith({
      data: { name: "Loyal", description: "Never betrays" },
    });
    expect(delegate.delete).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });

  it("createNameAttribute accepts input without description", async () => {
    const delegate = makeDelegate();

    await createNameAttribute(delegate, { name: "Short" });

    expect(delegate.create).toHaveBeenCalledWith({ data: { name: "Short" } });
  });

  it("deleteNameAttribute deletes by name and revalidates /manage", async () => {
    const delegate = makeDelegate();

    await deleteNameAttribute(delegate, "Loyal");

    expect(delegate.delete).toHaveBeenCalledTimes(1);
    expect(delegate.delete).toHaveBeenCalledWith({ where: { name: "Loyal" } });
    expect(delegate.create).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/manage");
  });

  it("does not revalidate when the Prisma call rejects", async () => {
    const delegate = makeDelegate();
    delegate.create.mockRejectedValueOnce(new Error("db down"));

    await expect(
      createNameAttribute(delegate, { name: "x" }),
    ).rejects.toThrow("db down");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
