import { z } from "zod";

export const REQUIRED_FIELD_MESSAGE = "Ce champ est requis";

/**
 * Required text field: an untouched (undefined) or empty value fails with a
 * French field-level message, mirroring the server schemas' `min(1).max(n)`.
 */
export function requiredString(max: number) {
  return z
    .string({ error: REQUIRED_FIELD_MESSAGE })
    .min(1, REQUIRED_FIELD_MESSAGE)
    .max(max);
}
