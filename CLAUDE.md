# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**ufactz** is a single-user, offline-first **PWA** for remembering people's names by
browsing your social circles and the cues you *do* remember (a dog's name, where someone
works). All data lives privately in the browser's **IndexedDB** — there is no backend,
no accounts, no network data path. "Sync" between devices is manual export/import JSON
(Settings route).

## Commands

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run dev:lan      # also serve on the LAN (open on your phone); note: PWA install
                     #   & offline need HTTPS, so LAN http only previews the UI
npm run build        # type-check (tsc --noEmit) THEN vite build → dist/
npm run preview      # serve the production build locally
npm run icons        # regenerate PWA PNG icons from public/icon.svg (only if it changes)
```

**There is no test runner and no linter.** The single quality gate is `npm run build` —
`tsc --noEmit` runs under a strict tsconfig (`strict`, `noUnusedLocals`,
`noUnusedParameters`, `noFallthroughCasesInSwitch`), so unused vars/params are hard
errors. Run `npm run build` to validate any change.

Deploy: `dist/` is fully static. The repo is wired for **Firebase Hosting** (`firebase.json`,
`.firebaserc`, site `ufactzproj`) — deploy with `firebase deploy`. The README also documents
Netlify Drop / Vercel / GitHub Pages; `base: './'` (vite.config.ts) keeps subfolder hosting working.

## Architecture

### Data model is a knowledge graph (`src/types.ts`)

Three node/edge types, and the design intent matters:

- **`Entity`** — a person *or* a pet, **all the same shape** (name + optional `emoji` icon +
  optional notes + `circleIds`). There is deliberately **no "type" field**; what something *is*
  emerges from its relationships (an entity with an `owner` is a pet). The `emoji` shows on the
  avatar (`Avatar` falls back to the name's initial when it's unset).
- **`Relationship`** — a *directed* edge storing a role word for **each** side (`fromRole`,
  `toRole`). Entered once, rendered from either card: "Mary is the mother of Sally" stores
  `from=Mary, to=Sally, fromRole=mother, toRole=child`; Sally's card shows "Mother: Mary",
  Mary's shows "Child: Sally".
- **`Circle`** — a named, colored, emoji'd group; entities reference circles by id (`circleIds`).

### State: one Zustand store, persisted to IndexedDB (`src/store.ts`)

`useStore` is the single source of truth and holds *all* app data plus the mutating actions
(add/update/delete for each type, plus `replaceAll`/`resetToSeed`/`clearAll` for
import/export/reset). Key things to know:

- Persisted via `zustand/middleware` `persist` over a custom `idb-keyval` `StateStorage`
  (storage key `ufactz-data`). `partialize` persists only `{circles, entities, relationships}`.
- **`hydrated` flag**: false until IndexedDB rehydration finishes. `App.tsx` shows a splash
  until then — components can assume data is loaded once rendered past the splash.
- **Schema versioning + migration**: `SCHEMA_VERSION` (types.ts) is the persist `version`.
  v1 was the old "whodat" app (people with `hooks`, circles with `hookSuggestions`); the
  `migrate` fn folds each person's hooks into `notes` and drops the type distinction. Later
  versions trimmed the entity shape (v3 dropped `photo`, v4 dropped the unused
  `createdAt`/`updatedAt` timestamps), so `migrate` rebuilds each stored entity with only the
  current fields to strip anything removed. A legacy storage key `whodat-data` is read-once and
  renamed so the rename didn't wipe data.
- **When you change the data model**: update `types.ts`, the relevant store reducers,
  `partialize`, **bump `SCHEMA_VERSION`**, and add a branch to `migrate`.
- Roles are normalized to **lowercase + trimmed on write** (`addRelationship`); use
  `titleCase()` only for display.

### Derived data: pure selectors (`src/lib/selectors.ts`)

Components read raw arrays from the store and pass them to pure functions — there's no derived
state in the store itself. `relationsOf` resolves every edge touching an entity to `{the other
entity, its role relative to me}`; `relationSummary` produces the one-line list subtitle;
`searchEntities` matches name then notes.

### Relationship vocabulary (`src/lib/vocab.ts`)

`ROLE_PAIRS` maps each role to its `counter` (and marks `symmetric` ones like sibling/spouse)
so picking one side of a relationship auto-fills the other (`counterRole`). The two-step
"Add relationship" UI (`routes/AddRelationship.tsx`) drives off this list and falls back to a
free-text custom pair. `PALETTE` and `EMOJI_CHOICES` are the circle-styling choices;
`ENTITY_EMOJI` is the fun-icon set offered for profiles (the `emoji-row`/`emoji-pick` picker
is shared by both `CircleEdit` and `EntityEdit`).

### Routing (`src/main.tsx`, `src/App.tsx`)

**`HashRouter` is intentional** — it keeps the app working on static/subfolder hosting and as an
offline PWA without server rewrites. Don't switch to `BrowserRouter`. Routes are flat and live
entirely in `App.tsx`; `routes/` holds one component per screen, `components/` holds the shared
shell (`AppBar`, `Avatar`, `Fab`, `EntityRow`).

### Other conventions

- **Styling is one global stylesheet** (`src/index.css`, ~600 lines) using CSS variables, with
  dark/light via `prefers-color-scheme` and `safe-area-inset` for notched phones. There are **no
  CSS modules or per-component styles** — add to `index.css` and use the existing classes
  (`app`, `content`, `row`, `chip`, `btn primary`, etc.).
- **IDs** come from `src/lib/uid.ts`, which falls back from `crypto.randomUUID` because LAN
  `http://` origins are not secure contexts.
- **Analytics** (`src/lib/analytics.ts`) is GA4, **production-only and gated on
  `VITE_GA_MEASUREMENT_ID`** (`.env.production`). Page views are sent manually on route change
  (HashRouter SPA) with record IDs collapsed to `:id`.
- **Persistent storage** is requested best-effort on load (`src/lib/persist.ts`) to exempt the
  IndexedDB data from eviction.
