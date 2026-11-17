import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../..");
const doc = readFileSync(
  path.join(repoRoot, "documentation/reference/authorization-model.md"),
  "utf8",
);

// Literal repo paths only: spans with spaces or globs (`src/actions/**`) are skipped.
const PATH_SPAN =
  /^(app|components|lib|src|tests|prisma|documentation)\/[^\s*]+$/;
const citedPaths = [...doc.matchAll(/`([^`\n]+)`/g)]
  .map((match) => match[1])
  .filter((span) => PATH_SPAN.test(span));
const uniquePaths = [...new Set(citedPaths)];

describe("authorization-model.md cited paths", () => {
  it("cites enough paths for the check to be meaningful", () => {
    expect(uniquePaths.length).toBeGreaterThanOrEqual(20);
  });

  it("only cites paths that exist in the repository", () => {
    const missing = uniquePaths.filter(
      (cited) => !existsSync(path.join(repoRoot, cited)),
    );

    expect(missing).toEqual([]);
  });
});
