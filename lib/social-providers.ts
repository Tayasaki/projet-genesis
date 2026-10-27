type Credentials = { clientId: string; clientSecret: string };
type SocialProviders = Record<string, Credentials & Record<string, unknown>>;

type ProviderEnv = Partial<
  Record<
    | "GITHUB_ID"
    | "GITHUB_SECRET"
    | "DISCORD_ID"
    | "DISCORD_SECRET"
    | "GOOGLE_ID"
    | "GOOGLE_SECRET",
    string
  >
>;

/** A provider is enabled only when both its ID and secret are set. */
export function buildSocialProviders(env: ProviderEnv): SocialProviders {
  const providers: SocialProviders = {};
  if (env.GITHUB_ID && env.GITHUB_SECRET) {
    providers.github = { clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET };
  }
  if (env.DISCORD_ID && env.DISCORD_SECRET) {
    providers.discord = { clientId: env.DISCORD_ID, clientSecret: env.DISCORD_SECRET };
  }
  if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
    providers.google = {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    };
  }
  return providers;
}
