// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { auth, getAuthSession, withoutClientInfo } from "@/lib/auth";

vi.hoisted(() => {
  process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
});
const requestHeaders = new Headers({ cookie: "session=abc" });
vi.mock("next/headers", () => ({ headers: async () => requestHeaders }));
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

describe("getAuthSession", () => {
  it("forwards the current request headers to Better Auth and returns its session", async () => {
    const session = { user: { id: "u1" } };
    const getSession = vi
      .spyOn(auth.api, "getSession")
      .mockResolvedValue(session as never);

    await expect(getAuthSession()).resolves.toBe(session);
    expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });

    getSession.mockRestore();
  });

  it("returns null when there is no active session", async () => {
    const getSession = vi.spyOn(auth.api, "getSession").mockResolvedValue(null as never);

    await expect(getAuthSession()).resolves.toBeNull();

    getSession.mockRestore();
  });
});
