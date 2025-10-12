# Copilot Instructions for Flux AI Image Generator

## Project Overview

This is a Next.js-based AI image generation platform that uses the Flux.1 AI model and Azure Flux models to generate high-quality images from text prompts. The application is built with TypeScript, uses Prisma for database management, and supports internationalization.

**Key Technologies:**
- **Framework:** Next.js 14.2.3 (App Router)
- **Language:** TypeScript (strict mode enabled)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with multiple providers (Google, GitHub, Email)
- **Styling:** TailwindCSS with Radix UI and Preline UI components
- **AI Models:** Replicate API (Flux.1) and Azure Flux (FLUX 1.1 [pro], FLUX.1 Kontext [pro])
- **Storage:** Cloudflare R2 for image storage
- **Internationalization:** next-intl for i18n support

## Project Structure

```
├── app/              # Next.js app directory
│   ├── [locale]/     # Internationalized routes
│   │   ├── (auth)/   # Authentication pages
│   │   ├── ai-image-generator/  # Image generation UI
│   │   ├── explore-image/       # Image gallery
│   │   └── image/               # Individual image pages
│   └── api/          # API routes
│       ├── auth/     # NextAuth configuration
│       ├── generated/# Image generation endpoints
│       └── predictions/  # AI prediction endpoints
├── components/       # React components
├── config/           # Configuration files
├── lib/             # Utility functions and shared logic
├── models/          # Prisma database models and queries
├── prisma/          # Prisma schema and migrations
├── services/        # Business logic layer
└── messages/        # i18n translation files
```

## Development Guidelines

### Code Style

1. **TypeScript Best Practices:**
   - Always use explicit types for function parameters and return values
   - Avoid using `any` type; use proper type definitions
   - Use interfaces for object shapes and types for unions/primitives
   - Follow existing patterns for error handling with `await-to-js`

2. **Next.js Conventions:**
   - Use Server Components by default; add `"use client"` only when needed
   - Place client-side logic in components with `"use client"` directive
   - API routes should be in `app/api/` directory
   - Use Next.js built-in image optimization with `next/image`

3. **Component Structure:**
   - Keep components small and focused on a single responsibility
   - Use Radix UI primitives for accessible UI components
   - Follow existing TailwindCSS utility patterns for styling
   - Place reusable components in the `components/` directory

4. **Database and Models:**
   - All database operations should go through Prisma
   - Use the query functions in `models/` directory, don't write raw queries in components
   - Follow the pattern: Component → Service → Model
   - Always handle errors with try-catch or `await-to-js`

### Environment Variables

Required environment variables are documented in `.env.example`. Key variables include:

- **Authentication:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_ID`, `GOOGLE_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
- **Database:** `POSTGRES_PRISMA_URL`, `POSTGRES_URL`
- **AI APIs:** `REPLICATE_API_TOKEN`, `AZURE_FLUX_11_PRO_ENDPOINT`, `AZURE_FLUX_11_PRO_API_KEY`, `AZURE_FLUX_KONTEXT_PRO_ENDPOINT`, `AZURE_FLUX_KONTEXT_PRO_API_KEY`
- **Storage:** `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_DOMAIN_URL`

**Important:** Never commit `.env` file or expose API keys in code.

### Azure Flux Integration

This project has comprehensive Azure Flux integration. Key points:

1. **Models Available:**
   - **FLUX 1.1 [pro]:** Text-to-image generation (6× faster, up to 4 MP images)
   - **FLUX.1 Kontext [pro]:** Image editing and enhancement (8× faster)

2. **API Format:**
   - Uses Azure OpenAI Image API format
   - Authentication via `api-key` header
   - Response structure: `data[0].url` contains the generated image URL
   - Quality parameter set to "hd" for FLUX 1.1 [pro]

3. **Documentation:**
   - See `AZURE_FLUX_SETUP.md` for setup instructions
   - See `AZURE_FLUX_INTEGRATION.md` for technical details
   - See `TESTING_GUIDE.md` for testing procedures
   - See `EXAMPLE_API_CALLS.md` for API examples

4. **Supported Aspect Ratios:**
   - 1:1 (1024×1024) - Square images
   - 16:9 (1344×768) - Landscape
   - 9:16 (768×1344) - Portrait
   - 3:2 (1216×832) - Standard photography
   - 2:3 (832×1216) - Portrait photography

### Development Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Initialize database:**
   ```bash
   npx prisma generate
   prisma migrate dev
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in all required values

4. **Run development server:**
   ```bash
   pnpm dev
   ```

5. **Lint code:**
   ```bash
   npm run lint
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

### Testing

- **Diagnostics Script:** `pnpm flux:diagnostics` (runs Azure endpoint checks + local helper validations)
  - Remote only: `pnpm flux:diagnostics:remote`
  - Local helpers only: `pnpm flux:diagnostics:local`
- **Manual Testing:** Follow the walkthrough in `docs/TESTING_GUIDE.md`
- **No Unit Tests:** Currently, there are no automated unit tests configured. Manual testing is the primary validation method.

### Common Patterns

1. **Error Handling:**
   ```typescript
   import to from "await-to-js";
   
   const [error, result] = await to(someAsyncFunction());
   if (error) {
     console.error(error.message);
     return;
   }
   ```

2. **Database Queries:**
   ```typescript
   // Use model functions, not direct Prisma calls in components
   import { queryGeneration } from "@/models/generation";
   
   const generation = await queryGeneration({ id: generationId });
   ```

3. **API Routes:**
   ```typescript
   // Use Next.js 14 route handlers
   export async function POST(request: Request) {
     const body = await request.json();
     // Handle request
     return Response.json({ data: result });
   }
   ```

4. **Internationalization:**
   ```typescript
   import { useTranslations } from "next-intl";
   
   const t = useTranslations("namespace");
   const text = t("key");
   ```

### Security Considerations

1. **API Keys:** Never expose API keys in client-side code
2. **Authentication:** All protected routes should check authentication status
3. **Content Safety:** Azure Flux includes built-in content safety filters
4. **Rate Limiting:** Consider rate limits for API endpoints
5. **Input Validation:** Always validate and sanitize user inputs

### Performance Best Practices

1. **Images:** Use Next.js Image component for optimization
2. **Caching:** Leverage Next.js caching for static content
3. **Database:** Use Prisma query optimization and proper indexing
4. **API Calls:** Implement proper error handling and retries for external APIs
5. **Code Splitting:** Use dynamic imports for heavy components

## Important Files

- `config/site.ts` - Site configuration and localization settings
- `lib/utils.ts` - Utility functions (cn, formatDate, absoluteUrl, etc.)
- `services/handleImage.ts` - Image-related business logic
- `prisma/schema.prisma` - Database schema
- `auth.ts` - NextAuth configuration

## Links and Resources

-- **Production Site:** https://autogen.design
- **Azure AI Foundry:** https://ai.azure.com/
- **Replicate API:** https://replicate.com/
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs

## Support and Contact

- **Twitter:** [@candytools118](https://x.com/candytools118)
-- **Email:** support@autogen.design
- **Issues:** Open GitHub issues for bugs and feature requests

## Notes for AI Assistants

- When making changes, always consider the internationalization aspect
- Respect the existing code patterns and structure
- Test Azure Flux integration thoroughly with both models
- Check that changes work across different aspect ratios
- Ensure proper error handling for all API calls
- Follow the principle of least privilege for sensitive operations
- Keep the codebase consistent with existing style and patterns
