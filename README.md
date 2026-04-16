# ras-fullpage-strategies

Production fullpage demo application for React Awesome Slider, deployed at [fullpage.caferati.dev](https://fullpage.caferati.dev).

This repository replaces the legacy `nextjs-example` implementation with a standalone Vite + React + TypeScript app while preserving the original `ras-fullpage-strategies` Git history and remote.

## Routes

The app keeps the route-shaped browser paths used by the original demo:

- `/`
- `/page-two`
- `/page-three`

The slider navigation remains the single source of truth for transitions, while the browser URL is kept in sync for direct loads and history navigation.

## Stack

- React 18
- Vite
- TypeScript
- Vitest + Testing Library
- Published npm packages only:
  - `@rcaferati/react-awesome-slider`
  - `@rcaferati/react-awesome-button`

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

## Deployment

This app is intended for external static hosting on `fullpage.caferati.dev`.

Production hosting must provide SPA rewrite fallback so these URLs all serve `index.html`:

- `/`
- `/page-two`
- `/page-three`

Without that rewrite behavior, direct loads to non-root routes will fail on a static host.

## Notes

- This app is private and is not published to npm.
- The production build should resolve slider and button code from published `@rcaferati/*` packages only.
- The in-app GitHub link points to the canonical repository: [rcaferati/ras-fullpage-strategies](https://github.com/rcaferati/ras-fullpage-strategies).
