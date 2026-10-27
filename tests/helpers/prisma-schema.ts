import { readFileSync } from "node:fs";
import path from "node:path";

export type PrismaColumn = {
  name: string;
  type: string;
  optional: boolean;
  hasDefault: boolean;
};

const SCHEMA_PATH = path.resolve(__dirname, "../../prisma/schema.prisma");

/**
 * Reads the scalar columns of every model in prisma/schema.prisma, keyed by
 * model name. Parses the schema text so the check runs without a generated
 * Prisma client (CI never runs `prisma generate` before the tests).
 * Relation fields (whose type is another model, or a list) are skipped:
 * they are not columns.
 */
export function readPrismaModels(
  source = readFileSync(SCHEMA_PATH, "utf8"),
): Map<string, PrismaColumn[]> {
  const blocks = [...source.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)];
  const modelNames = new Set(blocks.map(([, name]) => name));
  const models = new Map<string, PrismaColumn[]>();
  for (const [, name, body] of blocks) {
    const columns: PrismaColumn[] = [];
    for (const raw of body.split("\n")) {
      const line = raw.replace(/\/\/.*$/, "").trim();
      if (!line || line.startsWith("@@")) continue;
      const [field, typeToken] = line.split(/\s+/);
      if (!typeToken) continue;
      const optional = typeToken.endsWith("?");
      const type = typeToken.replace(/[?]$/, "");
      if (type.endsWith("[]") || modelNames.has(type)) continue;
      columns.push({
        name: field,
        type,
        optional,
        hasDefault: /@default\(|@updatedAt\b/.test(line),
      });
    }
    models.set(name, columns);
  }
  return models;
}
