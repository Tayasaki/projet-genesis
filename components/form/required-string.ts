import { z } from "zod";

export const REQUIRED_FIELD_MESSAGE = "Ce champ est requis";

/**
 * Required text field: an untouched (undefined) or empty value fails with a
 * field-level message, mirroring the server schemas' `min(1).max(n)`.
 */
export function requiredString(max: number, message: string = REQUIRED_FIELD_MESSAGE) {
  return z.string({ error: message }).min(1, message).max(max);
}
