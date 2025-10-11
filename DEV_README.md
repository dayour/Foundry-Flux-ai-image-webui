# Development notes

This file documents local developer helpers and small conventions used during development.

## Dev helper scripts

- `scripts/dev/create-test-account.js` — Seeds a local test user account for manual testing during development.
- `scripts/azure/flux-diagnostics.js` — Collection of verification tests for Azure FLUX endpoints and keys.

Keep these scripts in the repo — they're useful for local testing. Run them from the project root with Node.js.

## Theme keys

Two localStorage keys are used by different scripts to persist theme preferences:

- `theme` — canonical key used by modern components and helpers. Values: `dark`, `light`, or absent (for auto).
- `hs_theme` — legacy key used by the HS theme switcher library. Values: `dark`, `default`, `auto`.

To avoid inconsistencies, both keys are now kept in sync by `public/themeSwitcher.js` and `public/spaghetti.js` helpers.

## Notes

- `.next/` is a build artifact. Do not commit it; the `.gitignore` includes it.
- If you need a quick local dev server:

```pwsh
pnpm install
pnpm dev
```

If you want additional automation (tests, CI), I can scaffold a small test harness next.
