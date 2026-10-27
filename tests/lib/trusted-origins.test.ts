import { describe, expect, it } from "vitest";

import { originToDevHost, parseOriginList } from "@/lib/trusted-origins.mjs";
import { buildSocialProviders } from "@/lib/social-providers";

describe("parseOriginList", () => {
  it.each([
    [undefined, []],
    ["", []],
    ["   ", []],
    [",", []],
    [" a , ,b ", ["a", "b"]],
    ["a,b,", ["a", "b"]],
    ["http://app.dev.local:3000", ["http://app.dev.local:3000"]],
    ["a,a", ["a", "a"]],
  ])("parses %j", (input, expected) => {
    expect(parseOriginList(input)).toEqual(expected);
  });
});

describe("originToDevHost", () => {
  it.each([
    ["http://app.dev.local:3000", "app.dev.local"],
    ["https://example.com/some/path?x=1", "example.com"],
    ["app.dev.local", "app.dev.local"],
    ["localhost:3000", "localhost"],
    ["app.dev.local:3000", "app.dev.local"],
    ["192.168.1.10:8080", "192.168.1.10"],
    ["http://[::1]:3000", "[::1]"],
    ["  http://x.test  ", "x.test"],
    ["", null],
    ["   ", null],
    ["not a host!", null],
    ["http://", null],
    ["://", null],
  ])("maps %j to %j", (input, expected) => {
    expect(originToDevHost(input)).toBe(expected);
  });
});

describe("buildSocialProviders", () => {
  it("is empty when no provider env is set", () => {
    expect(buildSocialProviders({})).toEqual({});
  });

  it("ignores a provider with only half its credentials", () => {
    expect(buildSocialProviders({ GITHUB_ID: "id" })).toEqual({});
  });

  it("enables only fully configured providers", () => {
    const providers = buildSocialProviders({
      GITHUB_ID: "gid",
      GITHUB_SECRET: "gs",
      GOOGLE_ID: "oid",
      GOOGLE_SECRET: "os",
    });
    expect(Object.keys(providers).sort()).toEqual(["github", "google"]);
    expect(providers.github).toEqual({ clientId: "gid", clientSecret: "gs" });
    expect(providers.google).toMatchObject({ clientId: "oid", accessType: "offline" });
  });
});
