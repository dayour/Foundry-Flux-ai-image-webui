# Implementation Prompt: Brand Kit Generation Mode

## Context

You are implementing the Brand Kit Mode for Autogen Design, a Next.js 14 AI image generation platform. This mode enables users to generate complete, cohesive brand identities including logos, color palettes, typography, icons, and organized exports.

**Existing Architecture:**
- Next.js 14.2.33 with TypeScript (strict mode)
- Prisma ORM with PostgreSQL
- Azure Flux AI models for image generation  
- NextAuth.js for authentication
- TailwindCSS with Radix UI components
- Dark theme with pastel-neon gradients

**Related Files:**
- `components/Generator/ImageGenerator.tsx` - Main generation interface
- `components/Generator/types.ts` - Type definitions
- `hooks/usePrediction.ts` - Azure Flux API integration
- `services/handleImage.ts` - Image processing logic

## Task

Implement the Brand Kit Mode with:
1. Logo generation (5 variations: primary, secondary, icon, wordmark, submark)
2. Color palette generation (primary, secondary, accent, neutrals, semantic)
3. Typography system (heading/body pairing, type scale)
4. Icon library generation (16-24 branded icons)
5. Pattern library (3-5 seamless patterns)
6. Complete brand kit export (ZIP with organized folders)

## Technical Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS + custom CSS for previews
- Radix UI for dialogs and selects
- React Hook Form for configurations
- chroma-js for color manipulation
- Canvas API for generating color swatches

**Backend:**
- Next.js API routes
- Prisma for database
- Sharp for image processing (SVG → PNG)
- JSZip for brand kit packaging
- PDFKit for brand guide generation
 - GenAIScript to orchestrate the full Brand Kit pipeline (logo generation, palette derivation, typography pairing, asset exports)

GenAIScript workflow example for full brand kit generation:

```genaiscript
workflow "brand_kit_pipeline" {
  input { name: string; industry: string; style: string }
  step "logos" using provider.flux.generate_logo { name = input.name; industry = input.industry; style = input.style }
  step "palette" using provider.colors.generate { seed_color = logos.output.primary }
  step "typography" using provider.fonts.suggest { industry = input.industry; style = input.style }
  step "export" using provider.storage.package {
    assets = [logos.output.*, palette.output, typography.output]
    format = "zip"
  }
  output { packageUrl = export.output.url }
}
```

**Third-Party:**
- Google Fonts API for typography
- WCAG contrast checker library

## File Structure

Create these new files:

```
hooks/
  useBrandKit.ts                # Brand kit state management
  useColorGenerator.ts          # Color palette generation
  useTypographyGenerator.ts     # Font pairing logic

components/
  BrandKit/
    LogoGenerator.tsx           # Logo configuration + preview
    ColorPalette.tsx            # Color system UI
    ColorSwatch.tsx             # Individual color display
    TypographySystem.tsx        # Font pairing display
    IconLibrary.tsx             # Icon grid
    PatternLibrary.tsx          # Pattern previews
    BrandKitExport.tsx          # Export dialog
    BrandGuidePreview.tsx       # PDF preview

lib/
  brandColors.ts                # Color generation algorithms
  brandTypography.ts            # Font pairing database
  brandExport.ts                # ZIP packaging logic
  brandGuide.ts                 # PDF generation
  wcagContrast.ts               # Accessibility checking

app/api/
  brand-kit/
    generate-logo/
      route.ts                  # Logo generation endpoint
    generate-palette/
      route.ts                  # Color palette generation
    generate-icons/
      route.ts                  # Icon set generation
    export/
      route.ts                  # Brand kit export/download

models/
  brandKit.ts                   # Database queries
```

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model BrandKit {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  businessName  String
  industry      String
  description   String?
  
  // Logo assets
  logos         BrandLogo[]
  
  // Color system (JSON)
  colorPalette  Json?    // BrandColorPalette
  
  // Typography (JSON)
  typography    Json?    // BrandTypography
  
  // Icons & patterns
  icons         BrandAsset[]
  patterns      BrandAsset[]
  
  // Export
  lastExportUrl String?
  lastExportAt  DateTime?
  
  // Metadata
  version       Int      @default(1)
  tags          String[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([industry])
}

model BrandLogo {
  id            String   @id @default(cuid())
  brandKitId    String
  brandKit      BrandKit @relation(fields: [brandKitId], references: [id], onDelete: Cascade)
  
  variant       String   // "primary", "secondary", "icon", "wordmark", "submark"
  imageUrl      String
  svgUrl        String?
  
  width         Int
  height        Int
  
  config        Json     // LogoConfig
  
  createdAt     DateTime @default(now())
  
  @@index([brandKitId])
}

model BrandAsset {
  id            String   @id @default(cuid())
  brandKitId    String
  brandKit      BrandKit @relation(fields: [brandKitId], references: [id], onDelete: Cascade)
  
  type          String   // "icon", "pattern", "social-template"
  name          String
  imageUrl      String
  svgUrl        String?
  
  width         Int
  height        Int
  
  tags          String[]
  
  createdAt     DateTime @default(now())
  
  @@index([brandKitId, type])
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_brand_kit_mode
npx prisma generate
```

## Type Definitions

Add to `components/Generator/types.ts`:

```typescript
export interface LogoConfig {
  businessName: string;
  tagline?: string;
  industry: string;
  style: "modern" | "classic" | "playful" | "minimalist" | "bold" | "elegant";
  colorScheme: "monochrome" | "colorful" | "gradient" | "vibrant" | "muted";
  iconType?: "abstract" | "literal" | "geometric" | "organic" | "lettermark";
  vibe: string[];
}

export interface BrandColorPalette {
  primary: ColorDefinition;
  secondary: ColorDefinition;
  accent: ColorDefinition;
  neutrals: ColorDefinition[];
  semantic: {
    success: ColorDefinition;
    warning: ColorDefinition;
    error: ColorDefinition;
    info: ColorDefinition;
  };
}

export interface ColorDefinition {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  name: string;
  usage: string;
  accessibility: {
    contrastRatio: number;
    passes: {
      AA: boolean;
      AAA: boolean;
    };
  };
}

export interface BrandTypography {
  heading: FontDefinition;
  body: FontDefinition;
  accent?: FontDefinition;
  scale: {
    h1: { size: string; lineHeight: string; weight: number };
    h2: { size: string; lineHeight: string; weight: number };
    h3: { size: string; lineHeight: string; weight: number };
    body: { size: string; lineHeight: string; weight: number };
    small: { size: string; lineHeight: string; weight: number };
  };
}

export interface FontDefinition {
  family: string;
  fallback: string[];
  weights: number[];
  googleFontUrl?: string;
  preview?: string;
  usage: string;
  license: string;
}
```

## Component Implementation

### 1. LogoGenerator Component

**File:** `components/BrandKit/LogoGenerator.tsx`

```typescript
"use client";

import { useState } from "react";
import { LogoConfig } from "@/components/Generator/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import to from "await-to-js";

const LOGO_STYLES = [
  { value: "modern", label: "Modern", description: "Clean, contemporary design" },
  { value: "classic", label: "Classic", description: "Timeless elegance" },
  { value: "playful", label: "Playful", description: "Fun and approachable" },
  { value: "minimalist", label: "Minimalist", description: "Simple and refined" },
  { value: "bold", label: "Bold", description: "Strong and impactful" },
  { value: "elegant", label: "Elegant", description: "Sophisticated luxury" },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Food & Beverage",
  "Fashion", "Real Estate", "Entertainment", "Consulting", "E-commerce"
];

const VIBE_OPTIONS = [
  "Professional", "Friendly", "Innovative", "Trustworthy", "Creative",
  "Bold", "Luxurious", "Approachable", "Energetic", "Calm"
];

interface LogoGeneratorProps {
  onLogosGenerated: (logos: any[]) => void;
}

export function LogoGenerator({ onLogosGenerated }: LogoGeneratorProps) {
  const [config, setConfig] = useState<LogoConfig>({
    businessName: "",
    industry: "Technology",
    style: "modern",
    colorScheme: "colorful",
    vibe: [],
  });
  const [generating, setGenerating] = useState(false);
  const [logos, setLogos] = useState<any[]>([]);

  const updateConfig = <K extends keyof LogoConfig>(
    field: K,
    value: LogoConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!config.businessName) {
      alert("Please enter a business name");
      return;
    }

    setGenerating(true);

    const [error, response] = await to(
      fetch("/api/brand-kit/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
    );

    setGenerating(false);

    if (error || !response?.ok) {
      const errorData = await response?.json().catch(() => ({}));
      alert(errorData.error || "Logo generation failed");
      return;
    }

    const data = await response.json();
    setLogos(data.logos);
    onLogosGenerated(data.logos);
  };

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold">Business Information</h3>
        
        <div className="space-y-2">
          <Label>Business Name *</Label>
          <Input
            value={config.businessName}
            onChange={(e) => updateConfig("businessName", e.target.value)}
            placeholder="Acme Inc"
          />
        </div>

        <div className="space-y-2">
          <Label>Tagline (optional)</Label>
          <Input
            value={config.tagline || ""}
            onChange={(e) => updateConfig("tagline", e.target.value)}
            placeholder="Building the future"
          />
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={config.industry}
            onValueChange={(value) => updateConfig("industry", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visual Style */}
      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold">Visual Style</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOGO_STYLES.map(style => (
            <button
              key={style.value}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                config.style === style.value
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-zinc-700 hover:border-zinc-600"
              }`}
              onClick={() => updateConfig("style", style.value as any)}
            >
              <p className="font-semibold">{style.label}</p>
              <p className="text-xs text-zinc-400 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold">Color Approach</h3>
        
        <RadioGroup
          value={config.colorScheme}
          onValueChange={(value: any) => updateConfig("colorScheme", value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monochrome" id="monochrome" />
              <Label htmlFor="monochrome">Monochrome (Black & White)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="colorful" id="colorful" />
              <Label htmlFor="colorful">Colorful</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gradient" id="gradient" />
              <Label htmlFor="gradient">Gradient</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vibrant" id="vibrant" />
              <Label htmlFor="vibrant">Vibrant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="muted" id="muted" />
              <Label htmlFor="muted">Muted / Pastel</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Brand Vibe */}
      <div className="p-6 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-4">
        <h3 className="text-lg font-semibold">Brand Vibe (Select up to 3)</h3>
        
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map(vibe => {
            const isSelected = config.vibe.includes(vibe);
            const canSelect = config.vibe.length < 3 || isSelected;
            
            return (
              <Badge
                key={vibe}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer ${!canSelect && "opacity-50 cursor-not-allowed"}`}
                onClick={() => {
                  if (isSelected) {
                    updateConfig("vibe", config.vibe.filter(v => v !== vibe));
                  } else if (canSelect) {
                    updateConfig("vibe", [...config.vibe, vibe]);
                  }
                }}
              >
                {vibe}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generating || !config.businessName}
        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
        size="lg"
      >
        {generating ? "Generating logos..." : "Generate Logo Concepts (5 credits)"}
      </Button>

      {/* Logo Results */}
      {logos.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Generated Logos</h3>
          <div className="grid grid-cols-2 gap-6">
            {logos.map(logo => (
              <div key={logo.id} className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="bg-white p-8 rounded-lg mb-3">
                  <img src={logo.url} alt={`${logo.variant} logo`} className="w-full h-auto" />
                </div>
                <p className="text-sm font-semibold mb-2 capitalize">{logo.variant} Logo</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Download SVG</Button>
                  <Button size="sm" variant="outline">Download PNG</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2. Color Palette Generator

**File:** `lib/brandColors.ts`

```typescript
import chroma from "chroma-js";
import { BrandColorPalette, ColorDefinition } from "@/components/Generator/types";

export function generateBrandPalette(
  baseColor: string,
  style: "vibrant" | "muted" | "gradient" | "monochrome"
): BrandColorPalette {
  const base = chroma(baseColor);

  // Generate primary color
  const primary = createColorDefinition(
    base.hex(),
    "Primary",
    "Use for primary buttons, links, and key brand elements"
  );

  // Generate secondary (complementary or analogous)
  const secondaryHue = base.set("hsl.h", "+120").hex();
  const secondary = createColorDefinition(
    secondaryHue,
    "Secondary",
    "Use for secondary actions and accents"
  );

  // Generate accent (triadic)
  const accentHue = base.set("hsl.h", "+240").hex();
  const accent = createColorDefinition(
    accentHue,
    "Accent",
    "Use for CTAs and important highlights"
  );

  // Generate neutral scale
  const neutrals = [
    createColorDefinition("#FFFFFF", "White", "Backgrounds and text on dark"),
    createColorDefinition("#F5F5F5", "Light Gray", "Light backgrounds"),
    createColorDefinition("#E0E0E0", "Medium Gray", "Borders and dividers"),
    createColorDefinition("#9E9E9E", "Gray", "Secondary text"),
    createColorDefinition("#424242", "Dark Gray", "Primary text on light"),
    createColorDefinition("#212121", "Almost Black", "Headers and emphasis"),
    createColorDefinition("#000000", "Black", "Pure black for contrast"),
  ];

  // Generate semantic colors
  const semantic = {
    success: createColorDefinition("#10B981", "Success Green", "Success messages and confirmations"),
    warning: createColorDefinition("#F59E0B", "Warning Orange", "Warnings and cautions"),
    error: createColorDefinition("#EF4444", "Error Red", "Errors and destructive actions"),
    info: createColorDefinition("#3B82F6", "Info Blue", "Informational messages"),
  };

  return {
    primary,
    secondary,
    accent,
    neutrals,
    semantic,
  };
}

function createColorDefinition(
  hex: string,
  name: string,
  usage: string
): ColorDefinition {
  const color = chroma(hex);
  const rgb = color.rgb() as [number, number, number];
  const hsl = color.hsl();

  // Calculate WCAG contrast ratio (against white)
  const contrastRatio = chroma.contrast(hex, "#FFFFFF");

  return {
    hex,
    rgb,
    hsl: [
      isNaN(hsl[0]) ? 0 : hsl[0],
      isNaN(hsl[1]) ? 0 : hsl[1],
      isNaN(hsl[2]) ? 0 : hsl[2]
    ],
    name,
    usage,
    accessibility: {
      contrastRatio,
      passes: {
        AA: contrastRatio >= 4.5,
        AAA: contrastRatio >= 7,
      },
    },
  };
}

export function exportPaletteAsCSS(palette: BrandColorPalette): string {
  return `
:root {
  /* Primary Colors */
  --color-primary: ${palette.primary.hex};
  --color-primary-rgb: ${palette.primary.rgb.join(", ")};
  
  --color-secondary: ${palette.secondary.hex};
  --color-secondary-rgb: ${palette.secondary.rgb.join(", ")};
  
  --color-accent: ${palette.accent.hex};
  --color-accent-rgb: ${palette.accent.rgb.join(", ")};
  
  /* Neutrals */
  ${palette.neutrals.map((color, i) => 
    `--color-neutral-${i}: ${color.hex};`
  ).join("\n  ")}
  
  /* Semantic */
  --color-success: ${palette.semantic.success.hex};
  --color-warning: ${palette.semantic.warning.hex};
  --color-error: ${palette.semantic.error.hex};
  --color-info: ${palette.semantic.info.hex};
}
`.trim();
}

export function exportPaletteAsTailwind(palette: BrandColorPalette): string {
  return `
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "${palette.primary.hex}",
        secondary: "${palette.secondary.hex}",
        accent: "${palette.accent.hex}",
        success: "${palette.semantic.success.hex}",
        warning: "${palette.semantic.warning.hex}",
        error: "${palette.semantic.error.hex}",
        info: "${palette.semantic.info.hex}",
      }
    }
  }
}
`.trim();
}
```

### 3. Typography Pairing Database

**File:** `lib/brandTypography.ts`

```typescript
import { BrandTypography, FontDefinition } from "@/components/Generator/types";

interface FontPairing {
  heading: string;
  body: string;
  style: string;
  industries: string[];
}

const FONT_PAIRINGS: FontPairing[] = [
  {
    heading: "Playfair Display",
    body: "Source Sans Pro",
    style: "elegant",
    industries: ["Fashion", "Luxury", "Real Estate"],
  },
  {
    heading: "Montserrat",
    body: "Open Sans",
    style: "modern",
    industries: ["Technology", "Startups", "SaaS"],
  },
  {
    heading: "Raleway",
    body: "Lato",
    style: "clean",
    industries: ["Healthcare", "Consulting", "Education"],
  },
  {
    heading: "Oswald",
    body: "Roboto",
    style: "bold",
    industries: ["Sports", "Automotive", "Construction"],
  },
  {
    heading: "Merriweather",
    body: "Lora",
    style: "classic",
    industries: ["Publishing", "Legal", "Finance"],
  },
];

const FONT_DATABASE: Record<string, Omit<FontDefinition, "preview">> = {
  "Playfair Display": {
    family: "Playfair Display",
    fallback: ["Georgia", "serif"],
    weights: [400, 500, 600, 700, 800],
    googleFontUrl: "https://fonts.google.com/specimen/Playfair+Display",
    usage: "Use for headings and elegant emphasis",
    license: "Open Font License",
  },
  "Montserrat": {
    family: "Montserrat",
    fallback: ["system-ui", "sans-serif"],
    weights: [300, 400, 500, 600, 700],
    googleFontUrl: "https://fonts.google.com/specimen/Montserrat",
    usage: "Use for modern, geometric headings",
    license: "Open Font License",
  },
  "Source Sans Pro": {
    family: "Source Sans Pro",
    fallback: ["system-ui", "sans-serif"],
    weights: [300, 400, 600, 700],
    googleFontUrl: "https://fonts.google.com/specimen/Source+Sans+Pro",
    usage: "Use for body text and UI elements",
    license: "Open Font License",
  },
  "Open Sans": {
    family: "Open Sans",
    fallback: ["system-ui", "sans-serif"],
    weights: [300, 400, 600, 700],
    googleFontUrl: "https://fonts.google.com/specimen/Open+Sans",
    usage: "Use for clean, readable body text",
    license: "Open Font License",
  },
  // Add more fonts...
};

export function generateTypographySystem(
  style: string,
  industry: string
): BrandTypography {
  // Find matching pairing
  const pairing = FONT_PAIRINGS.find(
    p => p.style === style || p.industries.includes(industry)
  ) || FONT_PAIRINGS[0];

  const heading = FONT_DATABASE[pairing.heading];
  const body = FONT_DATABASE[pairing.body];

  return {
    heading,
    body,
    scale: {
      h1: { size: "3rem", lineHeight: "1.2", weight: 700 },
      h2: { size: "2.25rem", lineHeight: "1.3", weight: 600 },
      h3: { size: "1.75rem", lineHeight: "1.4", weight: 600 },
      body: { size: "1rem", lineHeight: "1.6", weight: 400 },
      small: { size: "0.875rem", lineHeight: "1.5", weight: 400 },
    },
  };
}

export function exportTypographyAsCSS(typography: BrandTypography): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=${typography.heading.family.replace(" ", "+")}:wght@${typography.heading.weights.join(";")}&family=${typography.body.family.replace(" ", "+")}:wght@${typography.body.weights.join(";")}&display=swap');

:root {
  /* Font Families */
  --font-heading: "${typography.heading.family}", ${typography.heading.fallback.join(", ")};
  --font-body: "${typography.body.family}", ${typography.body.fallback.join(", ")};
  
  /* Type Scale */
  --font-size-h1: ${typography.scale.h1.size};
  --font-size-h2: ${typography.scale.h2.size};
  --font-size-h3: ${typography.scale.h3.size};
  --font-size-body: ${typography.scale.body.size};
  --font-size-small: ${typography.scale.small.size};
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body, p {
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: ${typography.scale.body.lineHeight};
}
`.trim();
}
```

## API Implementation

### Logo Generation Endpoint

**File:** `app/api/brand-kit/generate-logo/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { LogoConfig } from "@/components/Generator/types";
import { z } from "zod";

const LogoConfigSchema = z.object({
  businessName: z.string().min(1),
  tagline: z.string().optional(),
  industry: z.string(),
  style: z.enum(["modern", "classic", "playful", "minimalist", "bold", "elegant"]),
  colorScheme: z.enum(["monochrome", "colorful", "gradient", "vibrant", "muted"]),
  vibe: z.array(z.string()).max(3),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = LogoConfigSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Invalid configuration", 
      details: validation.error 
    }, { status: 400 });
  }

  const config: LogoConfig = validation.data;
  const creditsRequired = 5; // 5 logo variations

  // Check credits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true }
  });

  if (!user || user.credits < creditsRequired) {
    return NextResponse.json({ 
      error: "Insufficient credits",
      required: creditsRequired,
      available: user?.credits || 0
    }, { status: 402 });
  }

  // Deduct credits
  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: creditsRequired } }
  });

  try {
    // Generate 5 logo variations
    const variants = ["primary", "secondary", "icon", "wordmark", "submark"];
    const logos = [];

    for (const variant of variants) {
      const prompt = buildLogoPrompt(config, variant);
      const imageUrl = await generateLogoImage(prompt);
      
      logos.push({
        id: crypto.randomUUID(),
        variant,
        url: imageUrl,
        config,
      });
    }

    return NextResponse.json({ logos });

  } catch (error) {
    console.error("Logo generation error:", error);
    
    // Refund credits on failure
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: creditsRequired } }
    });

    return NextResponse.json({ error: "Logo generation failed" }, { status: 500 });
  }
}

function buildLogoPrompt(config: LogoConfig, variant: string): string {
  const parts = [];
  
  if (variant === "primary") {
    parts.push(`Professional logo design for "${config.businessName}"`);
  } else if (variant === "icon") {
    parts.push(`Icon mark only for "${config.businessName}"`);
  } else if (variant === "wordmark") {
    parts.push(`Wordmark logo for "${config.businessName}"`);
  }
  
  parts.push(config.style);
  parts.push(`${config.industry} industry`);
  parts.push(config.colorScheme);
  
  if (config.vibe.length) {
    parts.push(config.vibe.join(", "));
  }
  
  parts.push("vector logo, clean, professional, white background");
  
  return parts.join(", ");
}

async function generateLogoImage(prompt: string): Promise<string> {
  // TODO: Integrate with Azure Flux generation
  // Reuse existing prediction logic from app/api/predictions/route.ts
  return "https://placeholder.com/logo.png";
}
```

## Integration with ImageGenerator

Update `components/Generator/ImageGenerator.tsx`:

```typescript
// Add import
import { LogoGenerator } from "@/components/BrandKit/LogoGenerator";
import { ColorPalette } from "@/components/BrandKit/ColorPalette";
import { TypographySystem } from "@/components/BrandKit/TypographySystem";

// Inside component
const [brandKit, setBrandKit] = useState({
  logos: [],
  palette: null,
  typography: null,
});

// In render
{generationMode === "brand" && (
  <div className="space-y-8">
    <LogoGenerator 
      onLogosGenerated={(logos) => setBrandKit(prev => ({ ...prev, logos }))}
    />
    
    {brandKit.logos.length > 0 && (
      <>
        <ColorPalette 
          onPaletteGenerated={(palette) => setBrandKit(prev => ({ ...prev, palette }))}
        />
        
        <TypographySystem
          onTypographyGenerated={(typography) => setBrandKit(prev => ({ ...prev, typography }))}
        />
        
        {brandKit.palette && brandKit.typography && (
          <Button className="w-full" size="lg">
            Export Complete Brand Kit
          </Button>
        )}
      </>
    )}
  </div>
)}
```

## Styling

Match existing dark theme:

```css
/* Add to globals.css */
.logo-preview {
  @apply bg-white rounded-lg shadow-lg;
}

.color-swatch {
  @apply rounded-lg border-2 border-transparent transition-all cursor-pointer;
}

.color-swatch:hover {
  @apply border-zinc-600 scale-105;
}

.font-preview {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.brand-kit-card {
  @apply p-6 bg-zinc-900/50 rounded-lg border border-zinc-800;
}
```

## Testing Checklist

- [ ] Logo generator creates 5 variations
- [ ] Color palette has proper contrast ratios
- [ ] Typography pairing loads Google Fonts
- [ ] All exports (CSS, Tailwind, JSON) work
- [ ] ZIP package has correct folder structure
- [ ] Credits are deducted correctly
- [ ] Failed generations refund credits
- [ ] WCAG AA accessibility passes
- [ ] Brand guide PDF generates correctly

## Success Criteria

1. ✅ Generate complete brand kit in <5 minutes
2. ✅ All logos export as SVG and PNG
3. ✅ Color palette passes WCAG AA
4. ✅ Typography system includes Google Font links
5. ✅ ZIP export is organized and professional
6. ✅ UI matches existing dark theme

## Timeline

- **Day 1:** Database schema + LogoGenerator component
- **Day 2:** Color palette generation + UI
- **Day 3:** Typography system + font pairing
- **Day 4:** Icon/pattern generation
- **Day 5:** Brand kit export (ZIP + PDF)
- **Day 6:** Testing + refinement

## Deliverables

1. ✅ Working logo generation (5 variants)
2. ✅ Color palette with accessibility checking
3. ✅ Typography system with previews
4. ✅ Complete brand kit export
5. ✅ PDF brand guide generation
6. ✅ Documentation updates

---

**Copy this entire prompt into a new chat window to implement Brand Kit Mode.**
