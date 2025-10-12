Development notes
=================

This file documents developer helper scripts and recommended local workflow.

Useful scripts
--------------
- scripts/dev/create-test-account.js — helper to seed a local test account for development.
- scripts/azure/flux-diagnostics.js — diagnostics for Azure FLUX endpoints and API keys.

Recommended workflow
--------------------
1. Install dependencies: pnpm install
2. Add a local .env with required environment variables (see .env.example)
3. Run the dev server: pnpm dev
4. Seed a test account (optional): node scripts/dev/create-test-account.js --email you@example.com
5. Run flux diagnostics to validate Azure endpoints: node scripts/azure/flux-diagnostics.js

Theme handling
--------------
We use a single canonical localStorage key `theme` with values `dark`, `light`, or `auto`.
Legacy script `themeSwitcher.js` used `hs_theme`. Both keys are kept in sync now; prefer `theme`.

Cleaning build artifacts
------------------------
- Don't commit build artifacts. Add `.next/` to .gitignore and remove it from the repository if present.
