# Azure Flux Integration – Testing Guide

This guide walks you through validating the Azure Flux integration and the supporting helper logic before pushing a release.

## 1. Prerequisites

- `.env` filled with Azure Flux endpoint URLs and API keys
- Local development server available at `http://localhost:3000`
- `pnpm install` completed so project dependencies are available

## 2. Run the Diagnostics Script

The diagnostics script exercises both Azure endpoints and the helper utilities (base64 handling, file naming, content filters, rate limiting).

```bash
pnpm flux:diagnostics
```

What it does:

- Sends a test prompt to **FLUX 1.1 [pro]** and **FLUX.1 Kontext [pro]**
- Confirms each response returns either an image URL or base64 payload
- Verifies local helper logic (buffer conversion, filename patterns, content safety parser, rate limiter)

### Focused Modes

- Remote-only checks (skip local helpers):

  ```bash
  pnpm flux:diagnostics:remote
  ```

- Local helper checks (skip API calls):

  ```bash
  pnpm flux:diagnostics:local
  ```

- Advanced usage / help:

  ```bash
  node scripts/azure/flux-diagnostics.js --help
  ```

The script exits with a non-zero status if any check fails, making it safe to wire into CI.

## 3. Manual API Spot Checks (Optional)

If you want to double-check responses manually, reuse the `curl` examples in [`docs/EXAMPLE_API_CALLS.md`](./EXAMPLE_API_CALLS.md). Focus on:

1. Verifying status code `200`
2. Confirming `data[0].url` (or `data[0].b64_json`) is present
3. Inspecting `content_filter_results` to ensure no categories are unexpectedly filtered

## 4. UI Smoke Test

1. Start the dev server

   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000`
3. Sign in or create a test account:

   ```bash
   pnpm dev:create-account
   ```

4. Generate an image using both Azure models and confirm the gallery updates

## 5. Troubleshooting Checklist

| Symptom | Suggested Action |
| ------- | ---------------- |
| Diagnostics fail with missing env variables | Double-check the `.env` file and restart the shell |
| API calls return 401 | Regenerate the Azure API keys and update `.env` |
| No image URL in response | Ensure the endpoint path matches `/images/generations?api-version=2025-04-01-preview` |
| Rate limiter failures during tests | Wait 60 seconds or reset the local server to clear in-memory counters |

## 6. Before Shipping

- Diagnostics script passes (`pnpm flux:diagnostics`)
- Manual UI smoke test produces valid images
- No uncommitted migrations or Prisma schema changes pending
- Linting succeeds (`pnpm lint`)

Following this checklist ensures the Azure Flux integration remains production-ready.
