import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  path.resolve(
    __dirname,
    "../../prisma/migrations/20261027140000_character_user_id/migration.sql",
  ),
  "utf8",
);
const statements = sql
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n");

describe("character_user_id migration", () => {
  it("is additive: no DROP, DELETE FROM or TRUNCATE", () => {
    expect(statements).not.toMatch(/\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i);
  });

  it("backfills only single-owner characters and only unowned rows", () => {
    expect(statements).toMatch(/HAVING COUNT\(DISTINCT s\."userId"\) = 1/);
    expect(statements).toMatch(/AND c\."userId" IS NULL;/);
  });
});

describe("better_auth_core_fields migration", () => {
  const coreSql = readFileSync(
    path.resolve(
      __dirname,
      "../../prisma/migrations/20261028000000_better_auth_core_fields/migration.sql",
    ),
    "utf8",
  )
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");

  it("is additive: no DROP, DELETE FROM, TRUNCATE or column type change", () => {
    expect(coreSql).not.toMatch(/\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i);
    expect(coreSql).not.toMatch(/ALTER COLUMN\s+"\w+"\s+(SET DATA\s+)?TYPE\b/i);
  });

  it("is idempotent: every ADD COLUMN uses IF NOT EXISTS", () => {
    const adds = coreSql.match(/ADD COLUMN\b/g) ?? [];
    const guarded = coreSql.match(/ADD COLUMN IF NOT EXISTS\b/g) ?? [];
    expect(adds.length).toBe(7);
    expect(guarded.length).toBe(adds.length);
  });

  it("gives every NOT NULL column it adds a default, so existing rows stay valid", () => {
    const added = [
      ...coreSql.matchAll(/ADD COLUMN\s+(?:IF NOT EXISTS\s+)?"\w+"[^,;]*/g),
    ].map((m) => m[0]);
    expect(added.length).toBe(7);
    for (const column of added.filter((c) => /NOT NULL/.test(c))) {
      expect(column).toMatch(/DEFAULT/);
    }
  });
});
