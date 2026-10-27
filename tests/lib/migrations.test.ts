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
