import { vi } from "vitest";
import { createSafeActionClient } from "next-safe-action";

export const TEST_USER_ID = "user-1";

type Fn = ReturnType<typeof vi.fn>;
export type PrismaMock = Record<string, Record<string, Fn>>;

/**
 * Lazily creates `prisma.<model>.<method>` spies so tests do not need to
 * enumerate the Prisma surface. Calls resolve to `undefined` by default.
 */
export function createPrismaMock(): PrismaMock {
  const models: PrismaMock = {};
  return new Proxy(models, {
    get(target, model: string) {
      target[model] ??= new Proxy({} as Record<string, Fn>, {
        get(methods, method: string) {
          methods[method] ??= vi.fn().mockResolvedValue(undefined);
          return methods[method];
        },
      });
      return target[model];
    },
  });
}

/**
 * Replacement for `@/lib/safe-action`: the real schema/validation pipeline of
 * next-safe-action, with the session middleware swapped for a fixed context.
 * Authentication and authorization are covered separately (tests/security).
 */
export function createSafeActionMock() {
  const base = createSafeActionClient({
    handleServerError: (error) => error.message,
  }).use(async ({ next }) => next({ ctx: { userId: TEST_USER_ID } }));
  return { action: base, authenticatedAction: base, authorizedAction: base };
}
