---
type: review
skill: x-review
created: 2026-04-04
target: "dependency-update-ui-overhaul — uncommitted working tree"
status: draft
---

# Readiness Review — Dependency Update + UI Overhaul

**Date**: 2026-04-04  
**Scope**: 27 files changed (168 insertions, 187 deletions)  
**Mode**: Full (all 6 agents)  
**Verdict**: **BLOCKED** — 1 in-diff HIGH security finding must be resolved before commit.

---

## Quality Gates

| Gate       | Command                      | Exit Code | Result                                                                       |
| ---------- | ---------------------------- | --------- | ---------------------------------------------------------------------------- |
| Lint       | `pnpm lint`                  | 0         | ✅ PASS (1 advisory warning — TanStack Table library compat, non-actionable) |
| Build      | `pnpm build` (with env vars) | 0         | ✅ PASS — all 14 routes compiled                                             |
| TypeScript | (via build)                  | 0         | ✅ PASS                                                                      |
| Tests      | No test suite                | N/A       | N/A                                                                          |

---

## Blocking Findings (must fix before commit)

### BLOCK-1 — V-SEC-01 / HIGH — Raw LLM output returned to client

**File**: `src/actions/character/character.action.ts:130`  
**OWASP**: A03:2021 Injection / A09:2021 Logging Failures  
**In diff**: Yes — new code introduced in the AI SDK v6 migration

```typescript
// Current — leaks raw LLM text to client
return { type: "validation-error", value: error.text };
```

`error.text` is the raw model output from `generateText`. In a prompt injection scenario, a user could craft input that causes the LLM to produce output that echoes the system prompt or contains injected content, which would then be returned verbatim to the client.

**Fix** (2-line change):

```typescript
// Safe — log server-side, return typed error only
console.error("[generateCharacter] NoObjectGeneratedError:", error.text);
return { type: "validation-error" };
```

---

## Non-Blocking Findings (high-value, adjacent context — pre-existing)

These issues were **not introduced by this branch** but were discovered during security audit of modified files. They should be tracked and fixed in a follow-up.

### ADJ-1 — V-SEC-02 / HIGH — IDOR on character mutations (adjacent, 2-agent agreement)

**File**: `src/actions/character/character.action.ts` (line ~142, ~192)  
**Confidence**: HIGH (flagged independently by both quality and security agents)

`updateCharacter` and `deleteCharacter` receive `ctx.userId` but never use it in the Prisma `where` clause. Any authenticated user can modify or delete any character by ID.

**Fix pattern**:

```typescript
.action(async ({ parsedInput, ctx: { userId } }) => {
  await prisma.character.update({
    where: { id: parsedInput.id, scenario: { some: { userId } } },
    ...
  });
```

### ADJ-2 — V-SEC-02 / HIGH — IDOR on weapon deletion (adjacent)

**File**: `src/actions/weapon/weapon.action.ts`

`deleteWeapon` uses `authenticatedAction` but never checks that the weapon belongs to `ctx.userId`.

### ADJ-3 — Logic bug — `onOpenChange` fires on dialog open (adjacent)

**File**: `components/features/layout/CharacterModal.tsx:31`

```tsx
// Current — router.back() fires on open AND close
<Dialog ... onOpenChange={() => router.back()}>

// Fix
<Dialog ... onOpenChange={(open) => { if (!open) router.back(); }}>
```

---

## Warnings (informational)

| ID  | Severity | Finding                                                                                  | File                                        |
| --- | -------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| W1  | MEDIUM   | `as any` casts in auto-form lack `// zod-v4-compat` audit markers                        | `auto-form/utils.ts`, `auto-form/index.tsx` |
| W2  | MEDIUM   | HoverCard pattern duplicated verbatim across Character.tsx and CharacterModal.tsx        | Both files                                  |
| W3  | MEDIUM   | `deleteAccount` sessionId param is redundant — authenticatedAction already enforces auth | `account.action.ts`                         |
| W4  | LOW      | README references NEXTAUTH\_\* env vars, project now uses better-auth                    | README.md                                   |
| W5  | LOW      | No CHANGELOG entry for this update                                                       | —                                           |

---

## Spec Compliance

| Task                          | Status     | Notes                                                                                                                                                                |
| ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 1: Dependencies + AI SDK | ✅ PASS    | All packages updated, v6 migration complete                                                                                                                          |
| Task 2: Performance           | ⚠️ PARTIAL | React.cache() ✓, useMemo ✓; Header DB query retained — better-auth session doesn't expose `role` without admin plugin (plan assumption incorrect, not a code defect) |
| Task 3: Code quality          | ✅ PASS    | Imports fixed, dead code removed, navigation corrected                                                                                                               |
| Task 4: UI polish             | ✅ PASS    | All items completed — gradient fix ✓, dark card token ✓, skeleton grid ✓, hover scale ✓, Badge ✓, empty state ✓, max-w-md removed from ScenarioList ✓                |

---

## Enforcement Summary

| Violation                                        | V-Code   | Severity | In-Diff                          | Status     |
| ------------------------------------------------ | -------- | -------- | -------------------------------- | ---------- |
| Raw LLM output (`error.text`) returned to client | V-SEC-01 | HIGH     | ✅ Yes                           | **BLOCK**  |
| IDOR on updateCharacter/deleteCharacter          | V-SEC-02 | HIGH     | ❌ Pre-existing                  | SUGGESTION |
| IDOR on deleteWeapon                             | V-SEC-02 | HIGH     | ❌ Pre-existing                  | SUGGESTION |
| onOpenChange fires on open                       | —        | MEDIUM   | ❌ Pre-existing                  | SUGGESTION |
| `as any` without audit markers                   | V-SEC-05 | MEDIUM   | ✅ Yes                           | WARN       |
| HoverCard duplication                            | V-DRY-01 | HIGH     | ❌ Pre-existing in changed files | WARN       |

**ANY BLOCK = cannot proceed to commit.**

---

## Verdict: BLOCKED

**1 blocking fix required:**

Remove `value: error.text` from the `NoObjectGeneratedError` catch return in `src/actions/character/character.action.ts:130`. Log `error.text` server-side only.

After fixing: re-run `pnpm build` (< 1 minute) and proceed to commit.

The pre-existing IDOR findings (ADJ-1, ADJ-2) and the onOpenChange bug (ADJ-3) are real issues that should be tracked and fixed in a follow-up PR, but they were not introduced by this branch and do not block this commit.
