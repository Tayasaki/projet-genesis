---
type: runbook
status: current
created: 2026-09-11
last_updated: 2026-09-11
---

# Recovering a Vercel preview DB stuck on Prisma P3009

## Symptom

Every PR's Vercel preview deploy fails at the `vercel-build` step (`prisma migrate deploy`)
with:

```
Error: P3009

migrate found failed migrations in the target database, new migrations will not be applied.
```

Because all open PRs share one Vercel preview Postgres, a single stuck migration blocks
**every** PR's preview, not just the one that originally triggered it.

## Diagnose

Pull the preview `DATABASE_URL` and inspect both the migration ledger and the columns the
stuck migration was supposed to add:

```bash
npx vercel link --yes
npx vercel env pull --environment=preview .env.preview
export DATABASE_URL=$(grep '^DATABASE_URL=' .env.preview | cut -d= -f2- | sed 's/^"//;s/"$//')
```

```sql
-- Migration ledger state
SELECT migration_name, started_at, finished_at, applied_steps_count, rolled_back_at
FROM "_prisma_migrations"
WHERE migration_name = '<stuck_migration_name>';

-- Did the DDL actually land?
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_name IN ('<TableA>', '<TableB>')
  AND column_name IN ('<col1>', '<col2>');
```

(`psql` is not installed in this environment — use Node's `pg` driver, already a project
dependency, to run these: `new Client({connectionString: process.env.DATABASE_URL})`.)

## Decide the resolve flag

Prisma wraps a migration's SQL in one transaction by default. A DDL failure partway through
means the whole statement rolls back — nothing commits, even though `_prisma_migrations`
still shows a `started_at`/no `finished_at` row.

| Evidence | Flag |
|---|---|
| Columns/DDL **absent** from the DB | `npx prisma migrate resolve --rolled-back <name>` |
| Columns/DDL **present** (partially or fully) | `npx prisma migrate resolve --applied <name>` |
| Present on some tables/columns but not others | **Stop.** Partial state outside either flag's clean semantics — needs manual cleanup first, do not guess |

## If the migration is fundamentally broken (this incident's case)

`--rolled-back` only clears the ledger — `prisma migrate deploy` will immediately retry the
*same* migration file and fail identically if the file itself is broken (e.g. `ADD COLUMN ...
NOT NULL` with no default, which always fails on a non-empty table).

Do **not** edit an already-committed migration file in place — its checksum may already match
a successful run elsewhere (a fresh CI DB, or production before this preview got stuck), and
editing it breaks that environment's history instead.

Instead:

1. `npx prisma migrate resolve --applied <broken_migration>` — treat it as superseded, not
   retried.
2. Author a new migration that performs the *safe* version of the same change (e.g. add the
   column nullable, `UPDATE` to backfill existing rows, then `ALTER COLUMN ... SET NOT NULL`).
3. `npx prisma migrate deploy` — the new migration applies cleanly; `migrate status` reports
   "up to date".

## Verify

```bash
npx prisma migrate status   # "Database schema is up to date!"
```

Then re-trigger one PR's preview build (push an empty commit, or `vercel redeploy`) and
confirm its `vercel-build` step completes without P3009.

**Every other open PR branch that predates the new migration file must merge/rebase it in**
before its own preview build will see the new migration and re-apply cleanly — the shared DB
being fixed does not update a branch's local `prisma/migrations/` folder.

## Incident reference

2026-09-11: `20251112102019_migration_to_better_auth` (adds `Account`/`Session`
`createdAt`/`updatedAt`) failed on the preview DB because `updatedAt` had no default and both
tables were non-empty (6 `Account` / 23 `Session` rows from prior manual preview testing).
Fixed per the steps above with a new migration,
`20251112102020_backfill_account_session_timestamps`.
