// Single home for the abuse limits on AI character generation.
// Kept out of character.action.ts because a "use server" module may only
// export async functions.

/** Longest accepted `message` for generateCharacter. */
export const MAX_GENERATION_PROMPT_LENGTH = 2000;

/** Accepted generation attempts per user inside GENERATION_WINDOW_MS. */
export const GENERATION_RATE_LIMIT = 10;

export const GENERATION_WINDOW_MS = 60 * 60 * 1000;

/**
 * Output cap for the gpt-4o call. The characterIASchema fields total at most
 * ~500 characters (name 50, origin 100, role 50, injury 100, extra 200, plus
 * age and pj) and 7 JSON keys; even at one token per character that stays
 * under 600, so valid output is never truncated while a runaway answer is.
 */
export const GENERATION_MAX_OUTPUT_TOKENS = 600;
