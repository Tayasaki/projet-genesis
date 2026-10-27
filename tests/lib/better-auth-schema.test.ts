// @vitest-environment node
import { getSchema } from "better-auth/db";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { readPrismaModels, type PrismaColumn } from "../helpers/prisma-schema";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
// The adapter only needs a client object at construction time. A stand-in
// without a generated data model also keeps Better Auth's own runtime check
// out of this test: the comparison below is the check.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

/** Prisma scalar types that hold each Better Auth field type. */
const COMPATIBLE_TYPES: Record<string, string[]> = {
  string: ["String"],
  boolean: ["Boolean"],
  date: ["DateTime"],
  number: ["Int", "BigInt", "Float", "Decimal"],
};

type Expected = ReturnType<typeof getSchema>;

let expected: Expected;
const models = readPrismaModels();

/** The Prisma adapter addresses model `Account` as `account`. */
function findModel(table: string): PrismaColumn[] | undefined {
  for (const [name, columns] of models) {
    if (name.charAt(0).toLowerCase() + name.slice(1) === table.charAt(0).toLowerCase() + table.slice(1)) {
      return columns;
    }
  }
  return undefined;
}

beforeAll(async () => {
  process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
  const { auth } = await import("@/lib/auth");
  expected = getSchema(auth.options);
});

describe("Better Auth core schema vs prisma/schema.prisma", () => {
  it("defines a Prisma model for every table Better Auth writes", () => {
    const missing = Object.keys(expected).filter((table) => !findModel(table));
    expect(missing, `missing Prisma models: ${missing.join(", ")}`).toEqual([]);
  });

  it("defines every column Better Auth writes, with a compatible type", () => {
    const problems: string[] = [];
    for (const [table, { fields }] of Object.entries(expected)) {
      const columns = findModel(table) ?? [];
      for (const [column, field] of Object.entries(fields)) {
        const actual = columns.find((c) => c.name === column);
        if (!actual) {
          problems.push(`${table}.${column} is missing`);
          continue;
        }
        const allowed = COMPATIBLE_TYPES[String(field.type)];
        if (allowed && !allowed.includes(actual.type)) {
          problems.push(
            `${table}.${column} is ${actual.type}, Better Auth writes ${String(field.type)}`,
          );
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("gives every column Better Auth never writes a default or makes it optional", () => {
    const problems: string[] = [];
    for (const [table, { fields }] of Object.entries(expected)) {
      for (const column of findModel(table) ?? []) {
        if (column.name === "id" || column.name in fields) continue;
        if (!column.optional && !column.hasDefault) {
          problems.push(`${table}.${column.name} is required but never written`);
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});
