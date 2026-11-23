// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: vi.fn() }));
vi.mock("@prisma/client", () => ({ PrismaClient: vi.fn() }));

describe("lib/prisma DATABASE_URL", () => {
  const original = process.env.DATABASE_URL;

  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { prisma?: unknown }).prisma;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  });

  it("throws a clear error instead of connecting to the string 'undefined'", async () => {
    delete process.env.DATABASE_URL;

    await expect(import("@/lib/prisma")).rejects.toThrow("DATABASE_URL is not set");
  });

  it("passes the configured URL to the pg adapter", async () => {
    process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/db";
    const { PrismaPg } = await import("@prisma/adapter-pg");

    await import("@/lib/prisma");

    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: "postgresql://u:p@localhost:5432/db",
    });
  });
});
