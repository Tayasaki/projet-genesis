import { describe, expect, it } from "vitest";

import { hasActionError, isSuccess } from "@/lib/action-result";

const cases: Array<[string, unknown, boolean]> = [
  ["undefined", undefined, false],
  ["null", null, false],
  ["empty object", {}, false],
  ["data result", { data: { id: 1 } }, false],
  ["rate-limited data result", { data: { type: "rate-limited" } }, false],
  ["plain string", "ok", false],
  ["falsy serverError", { serverError: "" }, false],
  ["serverError", { serverError: "boom" }, true],
  [
    "validationErrors",
    { validationErrors: { name: { _errors: ["x"] } } },
    true,
  ],
  ["empty validationErrors object", { validationErrors: {} }, true],
  ["both", { serverError: "boom", validationErrors: { _errors: ["x"] } }, true],
];

describe("hasActionError", () => {
  it.each(cases)("%s -> %s", (_label, input, expected) => {
    expect(hasActionError(input)).toBe(expected);
  });
});

describe("isSuccess", () => {
  it.each(cases)(
    "%s -> inverse of hasActionError",
    (_label, input, expected) => {
      expect(isSuccess(input)).toBe(!expected);
    },
  );
});
