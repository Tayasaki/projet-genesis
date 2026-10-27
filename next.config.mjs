/** Extra dev origins come from TRUSTED_ORIGINS (same list better-auth trusts);
 * Next expects bare hostnames, so strip scheme and port. localhost is always allowed. */
const extraDevOrigins = (process.env.TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    try {
      return new URL(origin).hostname;
    } catch {
      return origin;
    }
  });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: ["localhost", ...extraDevOrigins],
};

export default nextConfig;
