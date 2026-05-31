# ufactz — Social Clues 👤

> Social clues to jog your memory when a name's on the tip of your tongue.

A personal PWA for remembering people's names by browsing your social circles and
drilling down on the cues you *do* remember (a dog's name, a kid's name, where they
work). Built to feel like a native Android app, but it's just a web app — install it
to your home screen and it runs full-screen and offline.

## How it works

It's a small **knowledge graph**:

- **Circles** — your groups (Dog club, Work, Soccer u10s…). Big buttons on the home
  screen.
- **Profiles** — every entry is the same shape: a name + an optional fun icon and notes (no
  type field — the *relationships* tell you what something is). A profile is a person or
  a pet, and can belong to several circles.
- **Relationships** — directed links between profiles with a role word on each side, so
  you enter them once and they show on both. *"Mary is the mother of Sally"* → on Sally
  you see **Mother: Mary**, on Mary **Child: Sally**. *"Sarah owns Oreo"* → on Oreo
  **Owner: Sarah** (so you know Oreo's a dog without a type tag), on Sarah **Pet:
  Oreo**. Each profile's top relationship also shows as its subtitle in lists.
- **Recall flow** — at the park you remember the dog: open Dog club → tap **Oreo** →
  **Owner: James** 🎉. At soccer you remember the kid: tap **Sally** → **Mother:
  Mary**. Tap any related name to hop to that profile.
- **Search** finds any profile by name (or notes).

All data lives privately in your phone's IndexedDB. Use **Settings → Export** to back
it up or move it to a new phone.

## Develop

```bash
npm install
npm run icons     # regenerate PWA icons from public/icon.svg (only if you change it)
npm run dev       # http://localhost:5173
npm run dev:lan   # also serve on your LAN so you can open it on your phone
```

> Opening the LAN address (`http://<your-mac-ip>:5173`) on your phone lets you try the
> UI, but installing as a PWA and offline support need **HTTPS** — see Deploy.

## Build

```bash
npm run build     # type-checks, then outputs static files to dist/
npm run preview   # serve the production build locally
```

## Deploy (so you can install it on your phone)

The build in `dist/` is fully static and works on any host. Easiest path to an
installable app:

1. **Netlify Drop** — go to <https://app.netlify.com/drop> and drag the `dist/`
   folder in. You get an HTTPS URL instantly. Open it on your phone → Chrome menu (⋮)
   → **Add to Home screen**.
2. **Vercel / Cloudflare Pages / GitHub Pages** also work (relative `base` is already
   set, so subfolder hosting like GitHub project pages is fine).

## Tech

Vite · React · TypeScript · React Router (HashRouter) · Zustand + idb-keyval ·
vite-plugin-pwa.

## Project map

```
src/
  types.ts            data model (Circle, Entity, Relationship)
  store.ts            Zustand store, persisted to IndexedDB + v1→v2 migration
  lib/
    seed.ts           starter circles + example profiles & relationships
    selectors.ts      in-circle / relationship / search helpers
    vocab.ts          relationship role pairs, colour & emoji palettes
    persist.ts        durable-storage request + usage status
    uid.ts            id generator (secure-context safe)
  components/         Avatar, AppBar, Fab, EntityRow
  routes/             Home, CircleView, EntityDetail, EntityEdit,
                      AddRelationship, CircleEdit, Search, Settings
```
