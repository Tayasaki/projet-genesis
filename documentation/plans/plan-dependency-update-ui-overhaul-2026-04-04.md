---
type: plan
skill: x-plan
created: 2026-04-04
target: "Update all dependencies + efficiency and UI improvements for Projet Genesis"
status: approved
---

# Plan: Projet Genesis — Dependency Update + Efficiency & UI Overhaul

## Context

Projet Genesis is a Next.js 16 RPG scenario management app with character generation via OpenAI. The project needs:
1. **Dependency updates** to latest versions, including a breaking AI SDK migration (v3→v4)
2. **Performance improvements** — uncached DB queries, redundant auth calls, client-side sort without memoization
3. **UI/UX polish** — broken Tailwind class, aggressive hover animation, missing empty states, incorrect component imports

## Complexity

| Dimension | Value |
|-----------|-------|
| **Track** | Standard |
| **Files affected** | ~13 |
| **Layers** | Config / Server Actions / Server Components / Client Components / CSS |
| **Breaking changes** | Yes — AI SDK v3→v4 |

---

## Tasks

- [ ] **Task 1 — Dependency update + AI SDK migration**
  - Update `package.json` to latest versions for all packages
  - Migrate `ai` v3 → v4 and `@ai-sdk/openai` 0.0.x → 1.x
  - Fix `TypeValidationError` API in `character.action.ts`
  - Verify build passes: `pnpm install && pnpm build`
  - *Acceptance*: `pnpm build` exits 0 with no type errors; character generation endpoint still accepts requests without crashing

- [ ] **Task 2 — Performance: eliminate redundant DB queries + add caching**
  - `Header.tsx`: replace separate `prisma.user.findUnique()` call with role from session (better-auth includes role in user object)
  - `app/page.tsx` + `app/characters/page.tsx`: wrap Prisma calls with Next.js `cache()` from `react`
  - `DisplayCharacter.tsx`: wrap `filterCharacter` in `useMemo` to prevent recomputation on unrelated renders
  - *Acceptance*: `pnpm build` passes; Header no longer issues a second DB round-trip on every page

- [ ] **Task 3 — Code quality: dead code + import fix**
  - `lib/safe-action.ts`: remove unused `handleReturnedError` function (defined but never exported or called)
  - `components/features/layout/CharacterModal.tsx`: fix `AccordionContent` imported from `@radix-ui/react-accordion` (line 17) — should import from `@/components/ui/accordion`
  - `components/features/layout/CharacterModal.tsx`: fix `onClick={() => document.location.reload()}` on Edit button — use `router.push()` to navigate to edit route instead
  - *Acceptance*: `pnpm lint` exits 0; no unused imports

- [ ] **Task 4 — UI polish: layout, cards, empty states, dark mode**
  - `app/layout.tsx`: fix body `className` — `light:bg-gradient-to-b` is not a valid Tailwind variant; replace with standard classes: `bg-gradient-to-b from-slate-50/40 from-80% to-white dark:bg-background dark:from-background dark:to-background`
  - `app/globals.css`: fix dark mode card token — `--card` is currently identical to `--background`; set to a slightly lighter value (e.g., `--card: 222.2 47.4% 8%`) so cards are visually distinct
  - `loading.tsx`: fix skeleton grid — uses `grid-cols-4` but actual character grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`; align them
  - `components/features/layout/Character.tsx`: reduce `hover:scale-110` → `hover:scale-105`; replace emoji PJ/NPC indicator with a shadcn `Badge` component
  - `components/features/layout/ScenarioList.tsx`: add empty state when `scenario.length === 0`; remove `max-w-md` constraint on cards inside a grid
  - *Acceptance*: visual inspection — cards look distinct in dark mode; skeleton matches content grid; no broken gradients in light mode

---

## Critical Files

| Path | Role | Change Type |
|------|------|-------------|
| `package.json` | All dependency versions | Update |
| `src/actions/character/character.action.ts` | generateCharacter with AI SDK | Update (breaking migration) |
| `lib/safe-action.ts` | Server action wrapper | Refactor (remove dead code) |
| `components/features/layout/Header.tsx` | Sitewide header, auth + nav | Update (performance) |
| `app/page.tsx` | Home page, scenario list | Update (caching) |
| `app/characters/page.tsx` | User characters list | Update (caching) |
| `components/features/layout/DisplayCharacter.tsx` | Client-side filter/sort | Update (memoize) |
| `components/features/layout/CharacterModal.tsx` | Character detail dialog | Fix (import + navigation) |
| `components/features/layout/Character.tsx` | Character card component | Update (hover, Badge) |
| `components/features/layout/ScenarioList.tsx` | Scenario card grid | Update (empty state, card) |
| `app/layout.tsx` | Root layout, body styles | Fix (broken gradient class) |
| `app/globals.css` | CSS variables + Tailwind theme | Update (dark mode card) |
| `app/loading.tsx` | Global loading skeleton | Fix (grid columns) |

---

## Dependencies Between Tasks

```
Task 1 (deps) → must complete first — establishes working build baseline
Task 2 (performance) → can run after Task 1
Task 3 (code quality) → can run after Task 1, parallel with Task 2
Task 4 (UI polish) → can run after Task 1, parallel with Tasks 2-3
```

---

## Sprint Contract

### Machine-verifiable
- `pnpm install` exits 0
- `pnpm build` exits 0 (no type errors, no missing modules)
- `pnpm lint` exits 0

### Human-verifiable
- Character generation page works end-to-end in the browser
- Light mode: subtle gradient visible (slate → white)
- Dark mode: cards visually distinct from page background
- Loading skeleton matches character grid layout
- Character hover: 5% scale (not 10%)
- Character card: Badge shows "PJ" / "PNJ"
- Empty scenario list: placeholder message shown

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI SDK v4 breaking changes beyond `TypeValidationError` | HIGH | Check sdk.vercel.ai/docs/migration before updating |
| `better-auth` or `next-safe-action` major version API changes | MEDIUM | Run `pnpm outdated` first; review changelogs |
| `zod` v4 schema compatibility with resolvers | LOW | zod 4.1.12 already in use; check `@hookform/resolvers` compat |
| `pnpm overrides` for `@types/react` become stale | LOW | Update override versions to match new React types |

---

## Success Criteria

- [ ] `pnpm build` exits 0 after all dependency updates
- [ ] `pnpm lint` exits 0 with no warnings
- [ ] Character generation works end-to-end in the browser
- [ ] No redundant DB query in Header
- [ ] Dark mode cards are visually distinct from page background
- [ ] Loading skeleton matches the character grid layout
- [ ] No broken Tailwind classes in light mode gradient
