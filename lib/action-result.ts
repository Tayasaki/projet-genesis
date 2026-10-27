/** Fields of a next-safe-action result that signal a failed call. */
export type ActionErrorFields = {
  serverError?: unknown;
  validationErrors?: unknown;
};

/**
 * True when a next-safe-action result carries a truthy `serverError` or
 * `validationErrors` (an empty `{}` of validation errors still counts).
 * Anything else (undefined, void, a plain value, `{ data }`) is not an error.
 */
export function hasActionError(result: unknown): boolean {
  if (typeof result !== "object" || result === null) {
    return false;
  }
  const { serverError, validationErrors } = result as ActionErrorFields;
  return !!serverError || !!validationErrors;
}

/** Inverse of {@link hasActionError}. */
export function isSuccess(result: unknown): boolean {
  return !hasActionError(result);
}
