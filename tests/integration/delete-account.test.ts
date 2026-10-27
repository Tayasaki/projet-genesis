// @vitest-environment node
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { TEST_USER_ID } from "../helpers/action-mocks";

/**
 * Opt-in: runs the real deleteAccount action against a real, fully migrated
 * Postgres (same gate as better-auth-adapter.test.ts):
 *
 *   AUTH_IT_DATABASE_URL=postgresql://u:p@localhost:5432/db pnpm exec vitest run tests/integration/delete-account.test.ts
 */
const databaseUrl = process.env.AUTH_IT_DATABASE_URL;

vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionMock } = await import("../helpers/action-mocks");
  return createSafeActionMock();
});

const OTHER_USER_ID = "it-delete-account-other";
const userIds = [TEST_USER_ID, OTHER_USER_ID];

describe.skipIf(!databaseUrl)("deleteAccount against Postgres", () => {
  let prisma: typeof import("@/lib/prisma").prisma;

  async function cleanup() {
    await prisma.character.deleteMany({
      where: { name: { startsWith: "it-del-" } },
    });
    await prisma.suggestion.deleteMany({
      where: { name: "it-del-suggestion" },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.damage.deleteMany({ where: { name: "it-del-damage" } });
    await prisma.weight.deleteMany({ where: { name: "it-del-weight" } });
    await prisma.range.deleteMany({ where: { name: "it-del-range" } });
  }

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    ({ prisma } = await import("@/lib/prisma"));
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it("erases the caller's data without error and keeps everyone else's", async () => {
    const [damage, weight, range] = await Promise.all([
      prisma.damage.create({ data: { name: "it-del-damage" } }),
      prisma.weight.create({ data: { name: "it-del-weight" } }),
      prisma.range.create({ data: { name: "it-del-range" } }),
    ]);
    for (const id of userIds) {
      await prisma.user.create({
        data: {
          id,
          email: `${id}@example.test`,
          accounts: {
            create: { provider: "github", providerAccountId: `gh-${id}` },
          },
          sessions: {
            create: {
              sessionToken: `tok-${id}`,
              expires: new Date(Date.now() + 3_600_000),
            },
          },
          Scenario: {
            create: { id: `sc-${id}`, name: `it-del-sc-${id}`, universe: "u" },
          },
          Weapon: {
            create: {
              name: `it-del-w-${id}`,
              melee: true,
              damageId: damage.id,
              weightId: weight.id,
              rangeId: range.id,
            },
          },
          GenerationLog: { create: {} },
        },
      });
    }
    await prisma.suggestion.create({
      data: {
        type: "Fortune",
        name: "it-del-suggestion",
        userId: TEST_USER_ID,
      },
    });

    const mk = (name: string, userId: string | null, scenarioIds: string[]) =>
      prisma.character.create({
        data: {
          name: `it-del-${name}`,
          pj: true,
          userId,
          scenario: { connect: scenarioIds.map((id) => ({ id })) },
        },
      });
    await mk("owned", TEST_USER_ID, []);
    await mk("null-mine-only", null, [`sc-${TEST_USER_ID}`]);
    await mk("null-cross-linked", null, [
      `sc-${TEST_USER_ID}`,
      `sc-${OTHER_USER_ID}`,
    ]);
    await mk("null-unlinked", null, []);
    await mk("other-owned", OTHER_USER_ID, [`sc-${OTHER_USER_ID}`]);
    await mk("other-owned-in-mine", OTHER_USER_ID, [`sc-${TEST_USER_ID}`]);

    const { deleteAccount } = await import("@/src/actions/account.action");
    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeUndefined();
    expect(res?.validationErrors).toBeUndefined();

    const where = { userId: TEST_USER_ID };
    expect(await prisma.user.count({ where: { id: TEST_USER_ID } })).toBe(0);
    expect(await prisma.account.count({ where })).toBe(0);
    expect(await prisma.session.count({ where })).toBe(0);
    expect(await prisma.scenario.count({ where })).toBe(0);
    expect(await prisma.weapon.count({ where })).toBe(0);
    expect(await prisma.generationLog.count({ where })).toBe(0);

    const survivors = await prisma.character.findMany({
      where: { name: { startsWith: "it-del-" } },
      select: { name: true },
      orderBy: { name: "asc" },
    });
    expect(survivors.map((c) => c.name)).toEqual([
      "it-del-null-cross-linked",
      "it-del-null-unlinked",
      "it-del-other-owned",
      "it-del-other-owned-in-mine",
    ]);

    // Suggestion is SetNull: the row survives, detached from the departed user.
    expect(
      await prisma.suggestion.findUniqueOrThrow({
        where: { name: "it-del-suggestion" },
        select: { userId: true },
      }),
    ).toEqual({ userId: null });

    const other = { userId: OTHER_USER_ID };
    expect(await prisma.user.count({ where: { id: OTHER_USER_ID } })).toBe(1);
    expect(await prisma.account.count({ where: other })).toBe(1);
    expect(await prisma.session.count({ where: other })).toBe(1);
    expect(await prisma.scenario.count({ where: other })).toBe(1);
    expect(await prisma.weapon.count({ where: other })).toBe(1);
  });

  it("erases nothing when the caller has no account row", async () => {
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: `${TEST_USER_ID}@example.test`,
        Scenario: { create: { name: "it-del-sc-keep", universe: "u" } },
      },
    });

    const { deleteAccount } = await import("@/src/actions/account.action");
    const res = await deleteAccount({ sessionId: TEST_USER_ID });

    expect(res?.serverError).toBeDefined();
    expect(await prisma.user.count({ where: { id: TEST_USER_ID } })).toBe(1);
    expect(
      await prisma.scenario.count({ where: { userId: TEST_USER_ID } }),
    ).toBe(1);
  });
});
