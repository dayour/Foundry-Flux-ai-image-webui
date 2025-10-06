# DARBOT Autogen Design

Autogen Design is an AI-powered image generation platform built with Next.js that transforms text prompts into high-quality visuals. It features a prompt generator to help optimize your inputs and supports enterprise model deployments.

visit it ☞: [autogen.design](https://autogen.design)


## Features

- AI Image Generation: Generate high-quality images from text prompts using modern generative models (FLUX.1 variants supported).
- Azure Flux Support: Enterprise-grade image generation with FLUX 1.1 [pro] and FLUX.1 Kontext [pro] on Azure AI Foundry. See [Azure Flux Setup Guide](./AZURE_FLUX_SETUP.md) for details.
- Prompt Generator: Improve and refine your prompts to get the best results from the AI.
- i18n Support: Full internationalization support for multilingual audiences.
- Responsive Design: Built with TailwindCSS to ensure a responsive and clean user interface on all devices.


## Tech Stack

Framework: Next.js
Hosting: Vercel
Domain: Cypherdyne
Styling: TailwindCSS
Template: Radix UI & Preline UI


## Quick Started

Deploy on Vercel (Don't forget to setup env)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dayour/Foundry-Flux-ai-image-webui.git&project-name=autogen-design&repository-name=autogen-design)

### 1. Clone project

```bash
git clone https://github.com/darbotlabs/
```

### 2. Install dependencies

```bash
cd imagetoprompt-ai
pnpm i
```

### 3. Init database

create your database use [local postgres](https://wiki.postgresql.org/wiki/Homebrew) or [supabase](https://supabase.com/)

create tables and migrate:

```bash
npx prisma generate
prisma migrate dev
```

### 4. copy .env.example and rename it to .env

```env
GOOGLE_ID=
GOOGLE_SECRET=
NODE_ENV=development

GITHUB_ID=
GITHUB_SECRET=

EMAIL_SERVER=
EMAIL_FROM=

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

REPLICATE_API_URL=https://api.replicate.com/v1/predictions
REPLICATE_API_TOKEN=
REPLICATE_API_VERSION=

# Azure Flux Configuration (Optional)
# Get these from Azure AI Foundry after deploying FLUX models
# See: https://ai.azure.com/
AZURE_FLUX_11_PRO_ENDPOINT=
AZURE_FLUX_11_PRO_API_KEY=
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=
AZURE_FLUX_KONTEXT_PRO_API_KEY=

R2_ACCOUNT_ID=
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_DOMAIN_URL=


POSTGRES_DATABASE="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="xxxxx"
POSTGRES_PRISMA_URL="postgres://postgres:xxxxx@localhost:5432/localdb"
POSTGRES_URL="postgres://postgres:xxxxx@localhost:5432/localdb"
POSTGRES_URL_NON_POOLING="postgres://postgres:xxxxx@localhost:5432/localdb"
POSTGRES_URL_NO_SSL="postgres://postgres:xxxxx@localhost:5432/localdb"
POSTGRES_USER="postgres"
```

### Azure Flux Configuration (Optional)

To use Azure Flux models (FLUX 1.1 [pro] and FLUX.1 Kontext [pro]):

1. Sign up for an [Azure account](https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go) if you don't have one
2. Go to [Azure AI Foundry](https://ai.azure.com/)
3. Search for "FLUX-1.1-pro" or "FLUX.1-Kontext-pro" in the model catalog
4. Deploy the model and get your API endpoint and key
5. Add the endpoint and key to your `.env` file:
   - `AZURE_FLUX_11_PRO_ENDPOINT`: Your FLUX 1.1 [pro] endpoint URL (format: `https://your-resource.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview`)
   - `AZURE_FLUX_11_PRO_API_KEY`: Your FLUX 1.1 [pro] API key
   - `AZURE_FLUX_KONTEXT_PRO_ENDPOINT`: Your FLUX.1 Kontext [pro] endpoint URL (format: `https://your-resource.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview`)
   - `AZURE_FLUX_KONTEXT_PRO_API_KEY`: Your FLUX.1 Kontext [pro] API key

For more details, see [Azure Flux Setup Guide](./AZURE_FLUX_SETUP.md) and [Azure Flux Integration Guide](./AZURE_FLUX_INTEGRATION.md).

**Benefits of Azure Flux:**

- Enterprise-grade security and compliance
- 6-8× faster than other diffusion-based editors
- Built-in content safety filters
- Scalable deployments with autoscaling
- Unified access with other Azure AI services

**Azure Flux Use Cases:**

- **Creative Pipeline Acceleration**: Use FLUX 1.1 [pro] for storyboard ideation, then pass frames to Kontext [pro] for surgical tweaks
- **E-commerce Variant Generation**: Inject product shots and prompts to auto-paint seasonal backdrops while preserving SKU angles
- **Marketing Automation**: Pair with Azure OpenAI GPT-4o for copy generation and automated A/B testing
- **Digital Twin Simulation**: Use iterative editing to visualize equipment wear/tear over time in maintenance portals

### 5. Run it

```bash
pnpm dev
```

### 6. Open [http://localhost:3000](http://localhost:3000) for preview

![autogen.design](https://pub-f5fc00c4ca7b445d95004c53d4b77e82.r2.dev/images/%E6%88%AA%E5%B1%8F2024-08-16%2011.42.05.png "Autogen Design")
