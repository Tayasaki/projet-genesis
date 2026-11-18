import createNextIntlPlugin from "next-intl/plugin";
import { originToDevHost, parseOriginList } from "./lib/trusted-origins.mjs";

// Extra dev origins come from TRUSTED_ORIGINS (the list better-auth trusts);
// localhost is always allowed.
const extraDevHosts = parseOriginList(process.env.TRUSTED_ORIGINS)
  .map(originToDevHost)
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // The repo-root AGENTS.md is hand-maintained; keep `next dev` from generating or editing it.
  agentRules: false,
  allowedDevOrigins: [...new Set(["localhost", ...extraDevHosts])],
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
