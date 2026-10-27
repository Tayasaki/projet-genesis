// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { auth, withoutClientInfo } from "@/lib/auth";

vi.hoisted(() => {
  process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
});
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

describe("session data minimisation", () => {
  it("drops the client IP and user agent and keeps every other session field", async () => {
    const expiresAt = new Date("2030-01-01T00:00:00Z");
    const session = {
      userId: "u1",
      token: "t",
      expiresAt,
      ipAddress: "203.0.113.7",
      userAgent: "Mozilla/5.0",
    };

    await expect(withoutClientInfo(session)).resolves.toEqual({
      data: { userId: "u1", token: "t", expiresAt, ipAddress: null, userAgent: null },
    });
  });

  it("is the hook Better Auth runs before writing a session", () => {
    expect(auth.options.databaseHooks?.session?.create?.before).toBe(withoutClientInfo);
  });
});
