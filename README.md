# Autogen Design - AI Image Generator# Autogen Design - AI Image Generator



Autogen Design is a Next.js-based AI image generation platform powered by Azure FLUX models. Transform your text descriptions into stunning, high-quality images with advanced generative AI technology.Autogen Design is a Next.js-based AI image generation platform powered by Azure FLUX models. Transform your text descriptions into stunning, high-quality images with advanced generative AI technology.



**Live Demo**: [autogen.design](https://autogen.design)**Live Demo**: [autogen.design](https://autogen.design)



![Autogen Design Homepage](./docs/screenshots/homepage.png)![Autogen Design Homepage](./docs/screenshots/homepage.png)



## ✨ Features## ✨ Features



- **🎨 AI Image Generation**: Generate high-quality images from text prompts using Azure FLUX 1.1 [pro] and FLUX.1 Kontext [pro] models- **🎨 AI Image Generation**: Generate high-quality images from text prompts using Azure FLUX 1.1 [pro] and FLUX.1 Kontext [pro] models

- **⚡ Lightning Fast**: 6-8× faster than traditional diffusion-based image generators- **⚡ Lightning Fast**: 6-8× faster than traditional diffusion-based image generators

- **🔒 Enterprise-Grade Security**: Built-in content safety filters and Azure-powered infrastructure- **🔒 Enterprise-Grade Security**: Built-in content safety filters and Azure-powered infrastructure

- **📐 Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 3:2, and 2:3 aspect ratios- **📐 Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 3:2, and 2:3 aspect ratios

- **💾 Flexible Storage**: Local and Cloudflare R2 storage options with seamless switching- **💾 Flexible Storage**: Local and Cloudflare R2 storage options with seamless switching

- **🌐 Internationalization**: Full i18n support for multiple languages via next-intl- **🌐 Internationalization**: Full i18n support for multiple languages via next-intl

- **🎯 Model Management**: Dynamic model configuration with advanced settings dialog- **🎯 Model Management**: Dynamic model configuration with advanced settings dialog

- **🔐 Authentication**: Secure user authentication via NextAuth.js (Google, GitHub, Email, Credentials)- **🔐 Authentication**: Secure user authentication via NextAuth.js (Google, GitHub, Email, Credentials)

- **📱 Responsive Design**: Beautiful UI built with TailwindCSS, Radix UI, and Preline components- **📱 Responsive Design**: Beautiful UI built with TailwindCSS, Radix UI, and Preline components

- **🗄️ Database Integration**: PostgreSQL with Prisma ORM for user and generation management- **🗄️ Database Integration**: PostgreSQL with Prisma ORM for user and generation management



## 🛠️ Tech Stack

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.33 (App Router)

- **Language**: TypeScript (strict mode)- **Framework**: Next.js 14.2.33 (App Router)
# Autogen Design – AI Image Generator

[autogen.design](https://autogen.design)

![Autogen Design Homepage](./docs/screenshots/homepage.png)

## Overview

Autogen Design is a Next.js 14 application that turns text prompts into production-ready visuals using Flux.1 models. It ships with account management, gallery browsing, i18n-ready UI, and a robust Azure-first deployment story.**

## Features

- AI-powered text-to-image and image-to-image workflows via Flux 1.1 [pro] + FLUX.1 Kontext [pro]
- Authenticated user flows with saved generations, credits, and sharing controls
- Dynamic model configuration, including per-model settings and toggles in the UI
- Cloudflare R2 or local disk storage with instant switching
- Rate limiting, content filtering, and defensive input validation out of the box

## Tech Stack

- Next.js 14 App Router (React Server Components by default)
- TypeScript in strict mode with ESLint + Prettier
- NextAuth.js (Google, GitHub, email) backed by Prisma
- Prisma ORM with SQLite (dev) and PostgreSQL (staging/production)
- TailwindCSS + Radix UI + Preline components
- Flux.1 models via Azure AI Foundry + optional Replicate API

## Prereqs

- Node.js 18+ and pnpm 9+
- SQLite (bundled with Prisma) for local work; PostgreSQL 14+ for production/staging
- Azure account if you plan to run Flux.1 models; Cloudflare account for R2 storage
- Git, OpenSSL (for generating secrets), and optional Redis-compatible cache for rate limits

## Install

### Quick start (`pwsh`)

```powershell
git clone https://github.com/dayour/Foundry-Flux-ai-image-webui.git autogen-design
cd autogen-design
pnpm install
pnpm dlx prisma generate
pnpm dlx prisma migrate dev --name init
pnpm dev
 
UI/UX polish notes
------------------
- H1 uses responsive clamp() sizing to improve readability across widths.
- Hero CTAs reordered: primary "Generate Content" (pastel-neon-blue) and secondary ghost "Get started with Autogen Design".
- Global keyboard focus styles added to improve accessibility.
- Sticky navbar uses translucent background with backdrop blur for legibility on scroll.
- Skeleton loader component added at `components/Shared/SkeletonLoader.tsx` and wired to the generator preview for perceived performance.
- Terminal-style progress placeholder displayed during generation; replace with real websocket/progress integration when backend supports streaming.
 
Backend integration TODOs
------------------------
- Presets persistence: UI includes controls to save prompt + settings presets locally; add backend endpoints to store presets per-user if server persistence desired.
- Synthetic Assets: UI-only structured inputs added; server-side model needs schema to accept metadata — add routes and DB models if required.
```

> `pnpm dlx prisma` ensures the Prisma CLI version matches the workspace.

## Env vars

The app never reads server-only variables in the browser. API keys must only be referenced in Route Handlers, server actions, or edge/server utilities.

| Variable | Required | Scope | Notes |
| --- | --- | --- | --- |
| `NEXTAUTH_URL` | ✅ | server | Matches deployment origin, e.g. `http://localhost:3000` in dev |
| `NEXTAUTH_SECRET` | ✅ | server | `openssl rand -hex 32` |
| `POSTGRES_PRISMA_URL` | ✅ in prod | server | Primary Prisma datasource (Postgres DSN) |
| `POSTGRES_URL` | ✅ in prod | server | Connection string surfaced to runtime clients (drizzle, etc.) |
| `DATABASE_URL` | ✅ in dev | server | Prisma uses SQLite DSN `file:./dev.db` by default |
| `AZURE_FLUX_11_PRO_ENDPOINT` | ✅ when using Flux 1.1 | server | Keep out of client bundles |
| `AZURE_FLUX_11_PRO_API_KEY` | ✅ when using Flux 1.1 | server | Store in Azure Key Vault where possible |
| `AZURE_FLUX_KONTEXT_PRO_ENDPOINT` | ✅ when using Kontext | server | |
| `AZURE_FLUX_KONTEXT_PRO_API_KEY` | ✅ when using Kontext | server | |
| `REPLICATE_API_TOKEN` | optional | server | Enables Replicate fallback |
| `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_DOMAIN_URL` | optional | server | Only required for Cloudflare R2 |
| `GOOGLE_ID`, `GOOGLE_SECRET`, `GITHUB_ID`, `GITHUB_SECRET` | optional | server | Configure selected OAuth providers |
| `EMAIL_SERVER`, `EMAIL_FROM` | optional | server | Enables magic-link provider |

### `.env.example`

```env
# --- Core auth ---
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-long-random-string

# --- Local development database (SQLite) ---
DATABASE_URL=file:./prisma/dev.db

# --- Production/Postgres ---
# POSTGRES_PRISMA_URL=postgresql://user:password@host:5432/autogen
# POSTGRES_URL=${POSTGRES_PRISMA_URL}

# --- Azure Flux (required for image generation) ---
AZURE_FLUX_11_PRO_ENDPOINT=
AZURE_FLUX_11_PRO_API_KEY=
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=
AZURE_FLUX_KONTEXT_PRO_API_KEY=

# --- Optional providers ---
# GOOGLE_ID=
# GOOGLE_SECRET=
# GITHUB_ID=
# GITHUB_SECRET=
# EMAIL_SERVER=
# EMAIL_FROM=

# --- Optional storage ---
# R2_ACCOUNT_ID=
# R2_BUCKET=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# R2_DOMAIN_URL=

# --- Optional fallbacks ---
# REPLICATE_API_TOKEN=
```

## DB setup

- **Local development** defaults to SQLite (`prisma/dev.db`). No services to install—Prisma will create the file automatically when you run migrations.
- **Production** should use PostgreSQL (managed services such as Azure Database for PostgreSQL Flexible Server recommended). Update `POSTGRES_PRISMA_URL`/`POSTGRES_URL` and rerun migrations.

```powershell
# Dev (SQLite)
pnpm dlx prisma migrate dev

# Production (Postgres)
pnpm dlx prisma migrate deploy
```

## Azure setup

- Deploy Flux 1.1 [pro] + FLUX.1 Kontext [pro] via [Azure AI Foundry](https://ai.azure.com/).
- Copy the deployment endpoints + API keys into `.env` (server-only usage).
- Lock down keys with Azure Key Vault / Managed Identities when deploying.
- Recommended reading in `docs/`:
  - [`docs/AZURE_FLUX_README.md`](./docs/AZURE_FLUX_README.md)
  - [`docs/AZURE_FLUX_QUICKSTART.md`](./docs/AZURE_FLUX_QUICKSTART.md)
  - [`docs/TESTING_GUIDE.md`](./docs/TESTING_GUIDE.md)

## Run

- `pnpm dev` – starts Next.js on `http://localhost:3000`
- `pnpm start` – runs the built output
- `pnpm dlx prisma studio` – inspect local data at `http://localhost:5555`
- `pnpm flux:diagnostics` – full Azure + helper smoke test

Generated images save to `public/generated/` (local) or Cloudflare R2 depending on `storage` config.

## Diagnostics

- `pnpm flux:diagnostics` – full suite (requires Azure creds)
- `pnpm flux:diagnostics:remote` – Azure endpoints only
- `pnpm flux:diagnostics:local` – local helper checks
- `pnpm lint` / `pnpm typecheck` – static analysis

## Troubleshooting & dev tips

- Port already in use? `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process`
- Reset SQLite: delete `prisma/dev.db` then rerun `pnpm dlx prisma migrate dev`
- Check Prisma client: `pnpm dlx prisma generate`
- Type errors referencing `bcryptjs`? See `pnpm add -D @types/bcryptjs`
- Regenerate model config cache: delete `.next/cache` and restart `pnpm dev`

## Contributing

1. Fork the repo and create a branch.
2. `pnpm lint && pnpm typecheck && pnpm test` before submitting.
3. Document new env vars or behavior in `docs/` + this README.

## License

MIT — see [`LICENSE`](./LICENSE).

---

Security considerations, diagrams, API examples, and Azure guidance live in [`docs/`](./docs). Always keep API keys server-side and rotate them regularly.

