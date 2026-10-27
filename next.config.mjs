import { originToDevHost, parseOriginList } from "./lib/trusted-origins.mjs";

// Extra dev origins come from TRUSTED_ORIGINS (the list better-auth trusts);
// localhost is always allowed.
const extraDevHosts = parseOriginList(process.env.TRUSTED_ORIGINS)
  .map(originToDevHost)
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  allowedDevOrigins: [...new Set(["localhost", ...extraDevHosts])],
};

export default nextConfig;
