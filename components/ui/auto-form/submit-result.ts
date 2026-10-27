/**
 * AutoForm resets only when its `onSubmit` handler succeeds. A handler fails by
 * throwing or by resolving a next-safe-action result carrying `serverError` or
 * `validationErrors`; anything else (void, a plain value, a clean result) succeeds.
 */
export function isSuccess(result: unknown): boolean {
  if (typeof result !== "object" || result === null) {
    return true;
  }
  const { serverError, validationErrors } = result as {
    serverError?: unknown;
    validationErrors?: unknown;
  };
  return !serverError && !validationErrors;
}
