---
type: reference
status: active
created: 2026-10-27
last_updated: 2026-10-27
review_trigger: "Any change to lib/safe-action.ts, lib/ownership.ts, the Role enum, an ownership column or relation in prisma/schema.prisma, or a server action / page that reads or writes user data; or when the NULL-owner Character rows are resolved."
---

# Authorization model

How authentication, role checks and data ownership work in this app. Statements here are derived from the code; paths are cited instead of line numbers so they do not rot. The "Known gaps" section lists open issues and is not a claim that they are fixed. Section 8 (known gaps) is the volatile section; sections 1-6 are the stable ones.

## 1. Two action clients (`lib/safe-action.ts`)

All server actions are built on `next-safe-action` clients exported from `lib/safe-action.ts`. Session lookup is `getAuthSession()` in `lib/auth.ts` (better-auth).

| Client | Middleware | Guarantees | Does NOT guarantee |
|---|---|---|---|
| `authenticatedAction` | Rejects when there is no `session.user.id`; passes `ctx.userId`. | The caller is logged in. | Anything about which rows the caller may touch. |
| `authorizedAction` | Same login check, then loads the `User` row and rejects unless `role` is `ADMIN` or `SUPERUSER`. Passes `ctx.userId`. | The caller is logged in and is staff (role read from the DB on every call). | Ownership scoping; it is used for global reference data only. |

Only `ActionError` messages reach clients; every other thrown error is masked, so `ActionError` messages must be static, user-safe strings and never interpolate caught error messages or data.

Neither client scopes data to an owner. Every handler that touches user-owned rows must add the ownership predicate itself (section 3).

## 2. Role model

- `enum Role { USER, SUPERUSER, ADMIN }` in `prisma/schema.prisma`; `User.role` defaults to `USER`.
- No code path assigns `SUPERUSER` or `ADMIN`: roles are changed directly in the database. Treat promotion as an operator task.
- `ADMIN` and `SUPERUSER` are treated identically in all three role checks (`lib/safe-action.ts`, `app/manage/page.tsx`, `components/features/layout/Header.tsx`).
- `app/manage/page.tsx` also computes `isAuthorized` from the role to decide which management UI to show. That is presentation only; the server actions enforce the real check.

## 3. Ownership model

Every predicate and ownership assertion lives in `lib/ownership.ts` (`scenarioOwnedBy`, `weaponOwnedBy`, `characterOwnedBy`, `charactersOwnedBy`, `charactersErasedWithUser`, `assertOwnedScenario`, `assertOwnedCharacter`, `assertOwnedWeapons`). Sites import from there; none re-derives a predicate inline. Unit tests: `tests/lib/ownership.test.ts`.

| Entity | Owner | Predicate |
|---|---|---|
| `Scenario` | `Scenario.userId` | `scenarioOwnedBy(id, userId)` = `{ id, userId }` |
| `Weapon` | `Weapon.userId` | `weaponOwnedBy(id, userId)` = `{ id, userId }` |
| `Character` | `Character.userId` (nullable, `onDelete: Cascade`, indexed) | `characterOwnedBy(id, userId)` = `{ id, userId }`; lists use `charactersOwnedBy(userId)` = `{ userId }` |
| Reference data (Temperment, Alignment, Fortune, Strength, Weakness, CharacterSkill, WeaponSkill, Ammo, Damage, Range, Weight) | global, not user-owned | none; writes are staff-only via `authorizedAction` |
| `Suggestion` | global; `Suggestion.userId` records the author | creation is login-only and rate-limited; deletion and the listing page are staff-only |

Caveats on Character ownership:

- Ownership no longer depends on scenario links: a character with zero scenarios stays editable and deletable by its owner, and linking a character to another user's scenario grants that user nothing.
- `createCharacter` sets `Character.userId` from `ctx.userId` and verifies the supplied `scenarioId` belongs to the caller before creating; `updateScenarioCharacter` requires the caller to own both the character (`assertOwnedCharacter`) and the scenario (`scenarioOwnedBy`).
- Legacy rows: migration `20261027140000_character_user_id` backfilled `userId` only when all of a character's scenarios shared one owner. Characters linked to scenarios of 2+ users, or to none, were left `NULL`. A `NULL` owner matches no predicate, so nobody can read, edit, delete, link or count those rows (fail-closed) until an operator assigns an owner; the audit query is in the migration file and the PR that introduced it. `deleteAccount` also removes `NULL`-owner rows linked only to the departing user's scenarios (`charactersErasedWithUser`).
- `getCharacters(scenarioId, userId)` (`src/query/character.query.ts`) filters with `charactersOwnedBy`, so `NULL`-owner and foreign-owned characters linked to a scenario are not listed and not readable.
- Operator steps after the new code is live in an environment (the migration is already applied on the shared preview DB, and older code creates `NULL`-owner characters until then): re-run the idempotent backfill `UPDATE` copied from the migration (it only touches `WHERE "userId" IS NULL` rows linked to a single owner), then run the audit query and assign owners by hand to what remains.

## 4. Page-level pattern

Pages under `app/` call `getAuthSession()` and then:

1. No session: `redirect("/login")` (`app/login/page.tsx` does the inverse and redirects authenticated users to `/`).
2. Owner-scoped lookup using the same predicates as section 3.
3. Not found or not owned: `notFound()`. Using `notFound()` rather than a distinct "forbidden" avoids revealing that the id exists.

Staff-only pages (`app/manage/page.tsx`, `app/suggestions/page.tsx`) additionally load the user and check the role. `app/suggestions/page.tsx` redirects anonymous callers to `/login` and calls `notFound()` for non-staff.

## 5. Writing a new action safely (checklist)

1. Choose the client: global reference data goes through `authorizedAction`; per-user data through `authenticatedAction`.
2. Define a zod `.schema(...)` for every input; never trust ids from the client.
3. For every row you read, update or delete, put the ownership predicate from `lib/ownership.ts` in the Prisma `where` (preferably a single `update`/`delete`/`deleteMany` carrying the predicate; `updateScenarioCharacter` is a read-then-write exception where the ownership check precedes the write for the same owner).
4. For every client-supplied id you `connect` to that points at a user-owned row (weapon ids, scenario ids), verify the caller owns it first; connecting an unverified id is an authorization bypass. Use the assertions in `lib/ownership.ts`: `createCharacter` and `updateCharacter` call `assertOwnedWeapons` (one `weapon.count` with `{ id: { in }, userId }`; the same error for missing and foreign ids) and `createCharacter` calls `assertOwnedScenario`. Reference data (skills, strengths, etc.) is connected by name to global rows and needs no ownership check.
5. Take the owner from `ctx.userId`, never from input.
6. Call `revalidatePath` for affected routes.
7. Add tests (section 6): an owner success case, an attacker rejection case, and the unauthenticated case.

## 6. Tests

- `tests/security/actions-ownership.test.ts` and `tests/security/pages-ownership.test.tsx`: exercise the real action clients and pages against an in-memory Prisma fake (`tests/security/ownership-fake.ts`) for owner, attacker and anonymous callers.
- `tests/security/metadata-ownership.test.tsx`: `generateMetadata` titles for owner, non-owner and anonymous callers.
- `tests/security/suggestions-authz.test.tsx`: `deleteSuggestion` staff gate and the `app/suggestions/page.tsx` anonymous / non-staff / staff paths.
- `tests/actions/*.test.ts`: per-action behaviour and validation. They replace `@/lib/safe-action` with `createSafeActionMock()` and a Prisma spy from `createPrismaMock()` in `tests/helpers/action-mocks.ts` (fixed `TEST_USER_ID`); auth and ownership are deliberately not covered there.
- Run with `pnpm test`.

## 7. Inventory (current state)

### Server actions (`src/actions/**`)

| Action | Client | Ownership scoping |
|---|---|---|
| `createScenario` | authenticated | sets `userId` from ctx |
| `updateScenarioCharacter` | authenticated | character via `assertOwnedCharacter` (`Character.userId`); scenario via `scenarioOwnedBy` |
| `deleteScenario` | authenticated | `deleteMany` with `scenarioOwnedBy` |
| `createCharacter` | authenticated | sets `Character.userId` from ctx; scenario checked with `assertOwnedScenario` when `scenarioId` given; client-supplied weapon ids verified with `assertOwnedWeapons` before connect |
| `updateCharacter` | authenticated | `characterOwnedBy` (`Character.userId`); client-supplied weapon ids verified with `assertOwnedWeapons` before `set` |
| `deleteCharacter` | authenticated | `characterOwnedBy` (`Character.userId`) |
| `generateCharacter` | authenticated | none (no user-owned data read); input capped at 2000 chars, `maxOutputTokens` 600, and 10 attempts per user per rolling hour counted in `GenerationLog` (userId + createdAt, no prompt text; ADMIN/SUPERUSER exempt); over-limit returns `{ type: "rate-limited" }` before any OpenAI call |
| `createWeapon` | authenticated | sets owner from ctx; `ammo`/`weight`/`range`/`damage`/skills connected by name (reference data) |
| `deleteWeapon` | authenticated | `weaponOwnedBy` |
| `deleteAccount` | authenticated | everything keyed on ctx `userId` (characters via `charactersErasedWithUser`); input `sessionId` must equal it |
| `createSuggestion` | authenticated | none; suggestions are global; each row records its author (`userId`); non-staff are limited to 5 per rolling hour (advisory-lock transaction), ADMIN/SUPERUSER exempt |
| `deleteSuggestion` | authorized | global data; staff-only |
| `create*`/`delete*` for Temperment, Alignment, Fortune, Strength, Weakness, CharacterSkill (`src/actions/character/*`) | authorized | global reference data |
| `create*`/`delete*` for Ammo, Damage, Range, Weight, WeaponSkill (`src/actions/weapon/*`) | authorized | global reference data |

`src/actions/attribute-crud.ts` holds the shared Prisma call for the reference-data actions and is auth-agnostic; its callers wrap it in `authorizedAction`.

### Routes and pages

| Route | Auth | Ownership scoping |
|---|---|---|
| `app/api/auth/[...all]/route.ts` | better-auth handler | n/a |
| `app/page.tsx` | login required | scenarios by `userId` |
| `app/login/page.tsx` | redirects logged-in users away | n/a |
| `app/profile/page.tsx` | login required (redirect) | counts by `userId` (`charactersOwnedBy` for characters) |
| `app/characters/page.tsx` | login required | `charactersOwnedBy` |
| `app/characters/[characterId]/page.tsx` | login required | page body uses `characterOwnedBy` and `notFound()`; `generateMetadata` also looks up the character with `characterOwnedBy` when a session exists and falls back to the generic title "Projet Genesis" otherwise or for non-owners |
| `app/[scenarioId]/characters/page.tsx` | login required | scenario via `scenarioOwnedBy` then `notFound()`; importable characters via `charactersOwnedBy` |
| `app/[scenarioId]/characters/@modal/(...)characters/[characterId]/page.tsx` | login required | `characterOwnedBy`, `notFound()` |
| `app/[scenarioId]/character-generation/page.tsx` | login required | does not verify `scenarioId` ownership on render; `createCharacter` verifies it on submit; weapons by `userId` |
| `app/manage/page.tsx` | login required; role read for UI | weapons by `userId`; mutations enforced by the action clients |
| `app/suggestions/page.tsx` | login required (redirect to `/login`); role read, non-staff get `notFound()` | global data; staff-only listing |
| `app/tos/page.tsx`, `app/privacy-policy/page.tsx` | login required (redirect) | n/a |
| `app/[scenarioId]/characters/layout.tsx` | none in the layout itself (the pages it wraps redirect); `generateMetadata` looks up the scenario with `{ id, userId }` when a session exists and falls back to the generic title "Projet Genesis" otherwise or for non-owners; wraps `/[scenarioId]/characters` and its `@modal` route | scenario by `{ id, userId }` (metadata only) |

## 8. Known gaps (open issues, not fixed by this document)

- Legacy `Character` rows with a `NULL` owner (cross-linked or zero-scenario at migration time) are unreachable until an operator assigns an owner (see section 3). The audit query lists them.
