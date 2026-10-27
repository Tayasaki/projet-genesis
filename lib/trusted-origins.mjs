// Plain ESM (not TS) so next.config.mjs can import it as well as lib/auth.ts.

/**
 * Split a comma-separated list, trimming entries and dropping empty ones.
 * @param {string | undefined} value
 * @returns {string[]}
 */
export function parseOriginList(value) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Reduce an origin ("http://app.dev.local:3000", "localhost:3000", "host")
 * to the bare hostname Next's allowedDevOrigins expects. Returns null when no
 * hostname can be derived. IPv6 hosts keep their brackets ("[::1]"), exactly
 * as URL.hostname reports them.
 * @param {string} origin
 * @returns {string | null}
 */
export function originToDevHost(origin) {
  const trimmed = origin.trim();
  if (!trimmed) return null;
  // Without a "scheme://", `new URL("host:3000")` reads "host:" as a scheme
  // and yields an empty hostname, so default one in.
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  try {
    return new URL(withScheme).hostname || null;
  } catch {
    return null;
  }
}
