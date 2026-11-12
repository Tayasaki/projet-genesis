---
name: projet-genesis
description: Minimal direction — neutral surfaces, one blue accent, Inter, calm interactions
colors:
  primary: "hsl(221.2 83.2% 53.3%)"
  background: "hsl(0 0% 100%)"
  card: "hsl(0 0% 100%)"
  border: "hsl(214.3 31.8% 91.4%)"
  muted-foreground: "hsl(215.4 16.3% 46.9%)"
typography:
  body-md:
    fontFamily: "Inter"
    fontSize: "0.875rem"
rounded:
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
---

> Visual design system / token registry for this project.
>
> Adopted 2026-11-11 as part of a full UI restyle (issue: UI refactor). Tokens live as CSS
> custom properties in `app/globals.css` (`:root` / `.dark`); this file documents what they
> mean and the interaction conventions that go with them. Not for architectural decisions —
> those live in ARCHITECTURE.md.

## Overview

"Minimal" direction: neutral grays, a single blue accent (shadcn's default `--primary`), Inter
throughout, generous but not excessive whitespace, calm interactions (no hover-scale/bounce).
Built entirely on the existing shadcn/ui + Radix + Tailwind v4 primitives — this is a restyle,
not a component-library swap.

## Colors

- `--primary` (blue, `hsl(221.2 83.2% 53.3%)`): the one accent — primary buttons, active nav
  state, links, focus rings. Do not introduce a second accent hue without updating this file.
- `--background` / `--card`: both white in light mode; cards are distinguished by `--border`,
  not a different fill, to keep surfaces calm.
- `--muted-foreground`: secondary text (descriptions, helper copy, nav links at rest).
- Dark mode mirrors the same relationships via `.dark`'s token values in `globals.css` —
  never hardcode a light-only color in a component; always go through the token.

## Typography

Inter (`next/font/google`, loaded once in `app/layout.tsx`). Page titles: `text-3xl
font-semibold tracking-tight`. Section/panel headings: `text-lg font-semibold`. Card titles:
`text-base font-semibold`. Body/description copy: `text-sm` with `text-muted-foreground` for
secondary text. Avoid `text-2xl`+ outside page-level `<h1>`s — oversized headings on compact
elements (list-item cards, panel titles) was the main source of the old UI's unbalanced
proportions.

## Components & patterns

- **Panels**: a bordered, rounded container (`FormPanel`, `components/ui/form-panel.tsx`) wraps
  every standalone create/edit form — `border-border bg-card rounded-xl border p-6`. `TabsContent`
  carries the same treatment by default now, so tabbed forms (`/manage`) get it for free.
- **Buttons**: no hover-scale or thick hover-ring (removed from `buttonVariants` — it read as
  bouncy/unpolished and amplified a destructive action with `hover:scale-110`). Hover is a plain
  background-color shift; focus-visible keeps a 2px ring for accessibility.
- **Badges**: use `Badge` (`components/ui/badge.tsx`) for short metadata tags (e.g. a scenario's
  universe) instead of ad hoc colored/italic text.
- **Logo**: `components/features/layout/Logo.tsx`'s `LogoMark` — a simple vector d20 mark in a
  rounded-square badge, themed via `--primary`/`--primary-foreground`. Replaces the raster
  `public/logo.png` (detailed fantasy clip-art) in the header/footer badge slot, which became an
  illegible blob at 24–28px. The raster logo can still be used full-size elsewhere (e.g. a
  favicon or a future marketing page) — it just isn't fit for a small flat UI badge.

## Active Constraints

- Keep shadcn/ui + Radix + Tailwind v4 — this direction restyles the existing primitives via
  tokens/variants, not a component-library swap.
- One accent color. A second hue needs a deliberate decision recorded here first.
