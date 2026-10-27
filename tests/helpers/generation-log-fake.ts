import { vi } from "vitest";

import type { PrismaMock } from "./action-mocks";

export type GenerationRow = { id: string; userId: string; createdAt: Date };

/**
 * In-memory stand-in for the GenerationLog table plus the `$transaction` /
 * `$executeRaw` surface generateCharacter uses. The transaction callback gets a
 * distinct `tx` object, so a query issued on the global client instead of `tx`
 * does not reach the rows. `events` records the order of lock/count/create.
 */
export function attachGenerationLogFake(prisma: PrismaMock) {
  const rows: GenerationRow[] = [];
  const events: string[] = [];
  let seq = 0;

  const tx = {
    $executeRaw: vi.fn(async () => {
      events.push("lock");
      return 0;
    }),
    generationLog: {
      count: vi.fn(
        async ({
          where,
        }: {
          where: { userId: string; createdAt: { gte: Date } };
        }) => {
          events.push("count");
          return rows.filter(
            (r) =>
              r.userId === where.userId && r.createdAt >= where.createdAt.gte,
          ).length;
        },
      ),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(async ({ data }: { data: { userId: string } }) => {
        events.push("create");
        const row = {
          id: `g${++seq}`,
          userId: data.userId,
          createdAt: new Date(),
        };
        rows.push(row);
        return row;
      }),
    },
  };

  const mutable = prisma as unknown as Record<string, unknown>;
  mutable.$transaction = vi.fn(async (cb: (t: typeof tx) => unknown) => {
    events.push("tx-start");
    const result = await cb(tx);
    events.push("tx-end");
    return result;
  });

  return { rows, events, tx };
}
