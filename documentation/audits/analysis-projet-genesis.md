---
type: analysis
skill: x-analyze
created: 2026-07-31
target: "codebase root (projet-genesis)"
status: draft
---

# Analysis — projet-genesis (2026-07-31)

## Context

Request: bring the project up to date, restore working authentication, and set up a workable
dev environment. Investigation combined manual recon (env/build reproduction, git history of
`lib/auth.ts` / `lib/env.ts`, prior review artifacts) with a 5-domain parallel agent audit
(quality, security, performance, architecture, integration coherence).

## Root Cause — Authentication Broken

Reproduced by running `pnpm build` in this environment: build fails immediately with
`Error: Invalid environment variables` because no `.env` file exists (confirmed absent —
only `.env*.local` and `.env` are gitignored, none present). Beyond that missing file, four
compounding defects mean authentication would still fail even with credentials supplied:

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                | Severity                                                                    | Evidence                                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A1  | `prisma/schema.prisma` `User.emailVerified` is typed `DateTime?`, a leftover from the pre-Nov-2025 NextAuth schema. better-auth's Prisma adapter reads/writes this field as `Boolean`. Every sign-in/account-link touching this field is a Prisma type-validation error waiting to happen.                                                                                                                                             | CRITICAL                                                                    | `prisma/schema.prisma:58` vs better-auth's expected boolean field                                                                                            |
| A2  | No `.env` file present; `lib/env.ts` declares all 3 OAuth provider credential pairs and `BETTER_AUTH_URL` as required (`z.string().min(1)`, not `.optional()`), so the app cannot build or start at all without configuring GitHub+Discord+Google OAuth apps — contradicting the README's claim that these are optional.                                                                                                               | CRITICAL                                                                    | `lib/env.ts:5-13`; reproduced via `pnpm build` (attached error: 7x `invalid_type` on GITHUB_ID/SECRET, DISCORD_ID/SECRET, GOOGLE_ID/SECRET, BETTER_AUTH_URL) |
| A3  | `lib/auth.ts:9` hardcodes `trustedOrigins: ["http://app.dev.local"]` (added Nov 2025 migration to better-auth), and `next.config.mjs` hardcodes `allowedDevOrigins: ["app.dev.local"]`. The real dev workflow requires an `/etc/hosts` entry mapping `app.dev.local`, which is undocumented anywhere. Following the README's literal instructions (browse `localhost:3000`) causes better-auth to reject the origin on OAuth callback. | HIGH                                                                        | `lib/auth.ts:9`, `next.config.mjs:4`                                                                                                                         |
| A4  | README and `docker-compose.yml` both configure `NEXTAUTH_URL` / `NEXTAUTH_SECRET` — stale NextAuth-era variable names. The code only reads `BETTER_AUTH_URL` (`lib/env.ts:24`). This was already flagged as W4 (LOW) in the 2026-04-04 review and never fixed; it is the direct reason a user following the README ends up with a broken/misconfigured auth env.                                                                       | HIGH (was under-rated LOW previously — re-rated given it fully blocks auth) | `README.md:42,95-96`, `docker-compose.yml:22-23`                                                                                                             |

**Conclusion**: "Authentication isn't working" is not one bug — it's a stack of four. A1 (schema
type mismatch) will keep breaking sign-in even after the env is fixed and must be corrected with
a migration (`emailVerified Boolean @default(false)`) plus a data-backfill for existing rows.

## Dev Environment Gaps

| #   | Finding                                                                                                                                                                                          | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| E1  | No `.env.example` file anywhere in the repo — nothing to copy from; the README's variable list doesn't match the code's actual required variables (see A4).                                      | HIGH     |
| E2  | `Dockerfile` is pinned to `node:18-alpine`; the project requires Node 20+ (per README, and as a practical matter for Next.js 16 / React 19). The documented Docker path is not currently usable. | HIGH     |
| E3  | No documented `/etc/hosts` requirement for `app.dev.local`, despite the app being hardwired to it (A3).                                                                                          | MEDIUM   |

## Dependency Staleness

`pnpm outdated` (ran in this session): everything is on a compatible minor/patch behind except
four packages with a major version available:

| Package          | Current | Latest | Note                                                                                                                                           |
| ---------------- | ------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ai-sdk/openai` | 3.0.63  | 4.0.26 | major — used only by `generateCharacter`; needs a scoped upgrade + test                                                                        |
| `ai`             | 6.0.176 | 7.0.45 | major — same call site                                                                                                                         |
| `eslint`         | 9.39.4  | 10.8.0 | major — intentionally pinned (per commit `dcc4473`): `eslint-plugin-react`/`import`/`jsx-a11y` don't support v10 yet. Re-check before bumping. |
| `typescript`     | 6.0.3   | 7.0.2  | major                                                                                                                                          |

All Radix UI packages, Prisma, better-auth, react-day-picker, date-fns, etc. have minor/patch
updates only (~30 packages, see raw `pnpm outdated` output). Low risk, batchable in one PR.

## Security — Broken Access Control (IDOR), Full Pattern

The 2026-04-04 review already flagged two IDOR instances (`updateCharacter`/`deleteCharacter`,
`deleteWeapon`) as HIGH, non-blocking, "fix in follow-up" — that follow-up never happened. The
security-domain sweep found the same missing-ownership-check pattern in **5 more places**:

| #                      | file:line                                                                     | OWASP | Severity | Description                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------- | ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1 (known, still open) | `src/actions/character/character.action.ts` (updateCharacter/deleteCharacter) | A01   | HIGH     | No `userId` scoping in `where` clause — any authenticated user can edit/delete any character.                                                          |
| S2 (known, still open) | `src/actions/weapon/weapon.action.ts` (deleteWeapon)                          | A01   | HIGH     | Same pattern for weapons.                                                                                                                              |
| S3 (new)               | `src/actions/character/character.action.ts:60-111` (createCharacter)          | A01   | HIGH     | Attaches to any client-supplied `scenarioId` with no ownership check.                                                                                  |
| S4 (new)               | `src/actions/scenario.action.ts:28-45` (updateScenarioCharacter)              | A01   | HIGH     | Scenario ownership checked, but the `characterId` being linked in is never validated as the caller's own.                                              |
| S5 (new)               | `app/[scenarioId]/characters/page.tsx:31-49`                                  | A01   | HIGH     | `prisma.scenario.findUnique` with no `userId` filter — any authenticated user can view any other user's scenario + character list by ID.               |
| S6 (new)               | `app/[scenarioId]/characters/@modal/(...)characters/[characterId]/page.tsx`   | A01   | HIGH     | No `getAuthSession()` call **and** no ownership filter — the most severe instance; flagged independently by both the security and architecture agents. |
| S7 (new)               | `src/actions/suggestion.action.ts` (createSuggestion/deleteSuggestion)        | A01   | MEDIUM   | Uses `authenticatedAction` not `authorizedAction` — any logged-in user can delete any other user's/admin's global suggestion entries.                  |
| S8 (new)               | `src/actions/character/character.action.ts:119-138` (generateCharacter)       | A04   | MEDIUM   | No rate limiting on OpenAI-backed generation — cost-abuse/DoS risk against the API budget.                                                             |
| S9 (new)               | `next.config.mjs`                                                             | A05   | MEDIUM   | No security headers (CSP, X-Frame-Options, HSTS, etc).                                                                                                 |
| S10 (new)              | repo-wide                                                                     | A05   | LOW      | No `middleware.ts` safety net — every route/action re-implements its own auth check, and S6 shows that's already regressed once.                       |

No injection, SSRF, hardcoded-secret, or file-upload vectors found beyond what's listed above;
Prisma queries are parameterized throughout.

## Code Quality

Dominant finding: **~1,000+ duplicated lines** across 11 near-identical "attribute" CRUD action
files (`alignment`, `weakness`, `temperment`, `strength`, `characterSkill`, `fortune`, `ammo`,
`damage`, `weaponSkill`, `weight`, `range`) and 11 matching form components — V-DRY-01 (HIGH).
Same entity list drives a switch-on-type dispatch in the two `*AttributesColumns.tsx` files
(V-SOLID-02, HIGH — OCP violation, every new attribute type needs edits in 2+ places).

User-facing correctness bug found in passing: `DeleteAccountButton`'s confirm handler is
`onClick={async () => {}}` — a no-op. The "Supprimer mon compte" button does nothing; the
`deleteAccount` action exists but is never wired up, and itself does 6 sequential deletes with
no `$transaction` (partial-failure risk if it's ever connected).

`CharacterForm.tsx` (350+ lines) mixes schema construction, AI-generation UX, and submit logic —
SRP violation (HIGH). Smaller duplication and dead-code items in the full agent report.

## Performance

`src/query/character.query.ts` and `weapon.query.ts` export bare Prisma calls with no
`React.cache()` wrapper (one query file, `getUserCharacters()`, does this correctly — it's the
established convention, just not applied everywhere). `/app/manage/page.tsx` alone fires 12
sequential uncached queries. HIGH impact on the `/manage` page in particular. Minor: the role
check in `app/manage/page.tsx` fetches the whole `User` row instead of `select: { role: true }`;
`CharacterForm.tsx` recomputes array transforms every render without `useMemo`.

## Architecture

Intended layering is `app/` (routes) → `src/actions|query/` → `lib/` (prisma/auth), but it's not
enforced: 8+ route files bypass `src/query` and call `prisma.*` directly, and — most notably —
`components/features/layout/Header.tsx`, a shared layout component rendered on nearly every
authenticated page, imports `@/lib/prisma` and `@/lib/auth` directly to do a raw role check. The
role-check logic itself is reimplemented independently 3 times (Header, `app/manage/page.tsx`,
and the `authorizedAction` wrapper that was supposed to be the single source of truth) — this is
the same class of drift that produced the S6 auth gap. `TabsManagement.tsx` is a god-component
orchestrating all 11 attribute form pairs (ties back to the DRY finding above). No circular
imports were found — the module graph is a clean DAG, just an unenforced one.

## Integration Coherence

Two auth wrappers exist by design (`authenticatedAction`, `authorizedAction` — the latter is a
role-checking superset, not a true duplicate) but neither expresses per-resource ownership
checks, which is exactly why the IDOR pattern (S1-S6) keeps recurring — there's no shared
primitive for "does this resource belong to this user," so every action re-derives it ad hoc (or
skips it). Error handling also drifts: most actions throw `ActionError` via the wrapper, but at
least two throw a bare `Error`, and `generateCharacter` returns a typed error object instead of
throwing — callers can't assume one error-handling shape.

## Could Not Verify

None — all HIGH/CRITICAL findings above were confirmed by direct file read or command
reproduction in this session (build failure, git history, live grep).

## Recommendations (Pareto-ranked)

1. **Fix the auth stack (A1-A4)** — this is the literal blocker: migrate `emailVerified` to
   `Boolean`, ship a correct `.env.example` with `BETTER_AUTH_URL` (not `NEXTAUTH_URL`), and
   either drop the `app.dev.local` hardcoding or document the hosts-file requirement.
2. **Fix the dev environment (E1-E3)** — `.env.example`, bump `Dockerfile` to Node 20+, document
   the hosts entry (or remove the dependency on it).
3. **Fix the IDOR pattern (S1-S6)** — one shared "assert resource ownership" helper used at all
   6 call sites closes the whole class at once, not just the 2 previously-known instances.
4. **Batch the safe dependency bumps** — ~30 packages, minor/patch only, low risk.
5. **Defer**: the 4 major-version dependency bumps (needs scoped migration work each), the DRY/
   architecture cleanup (real but not blocking "get it running"), performance caching pass.

Full per-domain findings (quality, security, performance, architecture, integration) were
gathered via 5 parallel subagents in this session; the tables above are the Pareto-filtered
summary. Raw `pnpm outdated` output and the `pnpm build` error trace are reproducible on demand.
