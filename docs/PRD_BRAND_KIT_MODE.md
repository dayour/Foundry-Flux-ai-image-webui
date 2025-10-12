# PRD: Brand Kit Generation Mode

## Product Overview

**Product Name:** Autogen Design - Brand Kit Mode  
**Version:** 1.0  
**Target Release:** Q1 2025  
**Owner:** DarbotLabs
**Status:** Planning

## Executive Summary

Brand Kit Mode transforms Autogen Design into a comprehensive brand asset generation tool. Users can generate complete, cohesive brand identities including logos, color palettes, typography pairings, patterns, icons, and style guides—all powered by AI and delivered as organized, production-ready assets.

## Problem Statement

### Current Pain Points
1. **Cost barrier:** Professional brand design costs $2,000-$10,000
2. **Time-consuming:** Manual brand development takes weeks
3. **Consistency challenges:** Maintaining visual consistency across assets
4. **Skill gap:** Small businesses lack design expertise
5. **Iteration overhead:** Changes require designer time and budget
6. **Asset organization:** No standardized way to manage brand files

### User Needs
- Generate professional logos quickly
- Create cohesive color schemes
- Get typography recommendations
- Produce matching icon sets
- Export organized brand guidelines
- Iterate rapidly on brand concepts
- Maintain consistency across all assets

## Target Users

### Primary Personas

**1. Startup Founder (Alex, 28)**
- Launching SaaS product
- Budget: $500 for branding
- Pain: Can't afford designer
- Goal: Professional brand identity in 48 hours
- Success: Cohesive brand that builds trust

**2. Marketing Manager (Jordan, 34)**
- Managing 5+ client brands
- Pain: Slow turnaround from design team
- Goal: Rapid brand concept exploration
- Success: 3-5 brand options in one day

**3. Freelance Designer (Maya, 31)**
- Client projects + personal work
- Pain: Initial concepts take too long
- Goal: AI-assisted ideation phase
- Success: 10× faster initial mockups

**4. Small Business Owner (Carlos, 45)**
- Local retail business
- Tech comfort: Low
- Pain: Existing brand feels dated
- Goal: Modern rebrand without hiring agency
- Success: Fresh look under $1,000

## Goals & Success Metrics

### Primary Goals
1. **Adoption:** 30% of Pro users try Brand Kit in first month
2. **Completion:** 70%+ generate complete brand kit (not just logo)
3. **Quality:** 4.3+ star rating on asset quality
4. **Export:** 80%+ download complete brand package
5. **Iteration:** Average 2.5 brand kits generated per user

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Brand Kits Created | 500/month | Analytics |
| Avg. Assets per Kit | 8+ items | Database query |
| Export Rate | 80%+ | Funnel analysis |
| Regeneration Rate | 40%+ | User behavior |
| Pro Conversion | 15%+ | Conversion tracking |

## Technical Stack & Orchestration

Use GenAIScript to orchestrate the multi-step Brand Kit pipeline (logo → palette → typography → icons → export). GenAIScript ensures reproducible runs, clean retries, and webhook callbacks for long-running exports.

Core stack: Next.js (TypeScript), Prisma, Sharp, JSZip, PDFKit, chroma-js, Google Fonts API.

## Feature Requirements

### Must-Have (V1)

#### 1. Logo Generation
**User Story:** As a founder, I want to generate multiple logo concepts so that I can find the perfect brand identity.

**Logo Variations:**
- **Primary Logo:** Full lockup with icon + wordmark
- **Secondary Logo:** Simplified version for small sizes
- **Icon Mark:** Standalone symbol/icon
- **Wordmark:** Text-only version
- **Submark:** Alternative compact version

**Customization Options:**
```typescript
interface LogoConfig {
  businessName: string;
  tagline?: string;
  industry: string;              // "Tech", "Food", "Fashion", etc.
  style: "modern" | "classic" | "playful" | "minimalist" | "bold" | "elegant";
  colorScheme: "monochrome" | "colorful" | "gradient" | "vibrant" | "muted";
  iconType?: "abstract" | "literal" | "geometric" | "organic" | "lettermark";
  vibe: string[];                // ["professional", "friendly", "innovative"]
}
```

**Logo UI:**
```tsx
<div className="logo-generator">
  <div className="form-section">
    <h3>Business Information</h3>
    <Input
      label="Business Name"
      value={config.businessName}
      onChange={value => updateConfig("businessName", value)}
      placeholder="Acme Inc"
    />
    <Input
      label="Tagline (optional)"
      value={config.tagline}
      onChange={value => updateConfig("tagline", value)}
      placeholder="Building the future"
    />
    <Select
      label="Industry"
      value={config.industry}
      onChange={value => updateConfig("industry", value)}
      options={INDUSTRY_OPTIONS}
    />
  </div>

  <div className="form-section">
    <h3>Visual Style</h3>
    <div className="style-grid grid grid-cols-3 gap-3">
      {LOGO_STYLES.map(style => (
        <button
          key={style.value}
          className={cn(
            "style-card",
            config.style === style.value && "active"
          )}
          onClick={() => updateConfig("style", style.value)}
        >
          <img src={style.preview} alt={style.label} />
          <span>{style.label}</span>
        </button>
      ))}
    </div>
  </div>

  <div className="form-section">
    <h3>Color Approach</h3>
    <RadioGroup
      value={config.colorScheme}
      onChange={value => updateConfig("colorScheme", value)}
    >
      <RadioItem value="monochrome">Monochrome (B&W)</RadioItem>
      <RadioItem value="colorful">Colorful</RadioItem>
      <RadioItem value="gradient">Gradient</RadioItem>
      <RadioItem value="vibrant">Vibrant</RadioItem>
      <RadioItem value="muted">Muted/Pastel</RadioItem>
    </RadioGroup>
  </div>

  <div className="form-section">
    <h3>Brand Vibe</h3>
    <MultiSelect
      value={config.vibe}
      onChange={value => updateConfig("vibe", value)}
      options={["Professional", "Friendly", "Innovative", "Trustworthy", "Creative", "Bold", "Luxurious", "Approachable"]}
      max={3}
    />
  </div>

  <Button
    onClick={handleGenerateLogos}
    className="w-full"
    size="lg"
  >
    Generate Logo Concepts (5 credits)
  </Button>
</div>

{/* Results Grid */}
<div className="logo-results grid grid-cols-2 gap-6 mt-8">
  {logoVariations.map(logo => (
    <div key={logo.id} className="logo-card">
      <div className="logo-preview bg-white p-8 rounded-lg">
        <img src={logo.url} alt="Logo concept" />
      </div>
      <div className="logo-actions flex gap-2 mt-3">
        <Button onClick={() => selectLogo(logo)}>Use This</Button>
        <Button variant="outline" onClick={() => regenerateLogo(logo)}>
          Regenerate
        </Button>
      </div>
      <p className="text-sm text-zinc-400 mt-2">{logo.variant}</p>
    </div>
  ))}
</div>
```

#### 2. Color Palette Generation
**User Story:** As a designer, I want AI-generated color palettes that work together so that my brand has visual harmony.

**Palette Structure:**
```typescript
interface BrandColorPalette {
  primary: ColorDefinition;      // Main brand color
  secondary: ColorDefinition;    // Accent color
  accent: ColorDefinition;       // Call-to-action color
  neutrals: ColorDefinition[];   // Grays, blacks, whites (3-5 shades)
  semantic: {
    success: ColorDefinition;
    warning: ColorDefinition;
    error: ColorDefinition;
    info: ColorDefinition;
  };
}

interface ColorDefinition {
  hex: string;           // "#7B61FF"
  rgb: [number, number, number];
  hsl: [number, number, number];
  name: string;          // "Electric Purple"
  usage: string;         // "Use for CTAs and primary actions"
  accessibility: {
    contrastRatio: number;  // WCAG contrast ratio
    passes: {
      AA: boolean;
      AAA: boolean;
    };
  };
}
```

**Palette UI:**
```tsx
<div className="color-palette-section">
  <h3>Brand Color Palette</h3>
  
  {/* Primary Colors */}
  <div className="color-row">
    <h4>Primary Colors</h4>
    <div className="flex gap-4">
      <ColorSwatch
        color={palette.primary}
        label="Primary"
        size="large"
        showHex
        showUsage
      />
      <ColorSwatch
        color={palette.secondary}
        label="Secondary"
        size="large"
        showHex
        showUsage
      />
      <ColorSwatch
        color={palette.accent}
        label="Accent"
        size="large"
        showHex
        showUsage
      />
    </div>
  </div>

  {/* Neutral Scale */}
  <div className="color-row">
    <h4>Neutral Scale</h4>
    <div className="flex gap-2">
      {palette.neutrals.map((color, i) => (
        <ColorSwatch
          key={i}
          color={color}
          label={color.name}
          showHex
        />
      ))}
    </div>
  </div>

  {/* Semantic Colors */}
  <div className="color-row">
    <h4>Semantic Colors</h4>
    <div className="flex gap-3">
      <ColorSwatch color={palette.semantic.success} label="Success" />
      <ColorSwatch color={palette.semantic.warning} label="Warning" />
      <ColorSwatch color={palette.semantic.error} label="Error" />
      <ColorSwatch color={palette.semantic.info} label="Info" />
    </div>
  </div>

  {/* Accessibility Report */}
  <div className="accessibility-report mt-4 p-4 bg-zinc-900/50 rounded-lg">
    <h5>Accessibility Check</h5>
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <p className="text-sm">Primary on White</p>
        <div className="flex items-center gap-2">
          <Badge variant={palette.primary.accessibility.passes.AA ? "success" : "error"}>
            {palette.primary.accessibility.passes.AA ? "✓" : "✗"} WCAG AA
          </Badge>
          <span className="text-xs text-zinc-400">
            {palette.primary.accessibility.contrastRatio.toFixed(2)}:1
          </span>
        </div>
      </div>
      {/* More contrast checks... */}
    </div>
  </div>

  {/* Export Options */}
  <div className="color-export mt-4">
    <Button onClick={exportAsCSS}>Export as CSS</Button>
    <Button onClick={exportAsTailwind}>Export for Tailwind</Button>
    <Button onClick={exportAsFigma}>Copy for Figma</Button>
  </div>
</div>
```

#### 3. Typography System
**User Story:** As a marketer, I want font pairings that look professional so that my brand feels polished.

**Typography Config:**
```typescript
interface BrandTypography {
  heading: FontDefinition;       // H1-H6
  body: FontDefinition;          // Paragraphs, UI text
  accent?: FontDefinition;       // Special callouts
  
  scale: {
    h1: { size: string; lineHeight: string; weight: number };
    h2: { size: string; lineHeight: string; weight: number };
    h3: { size: string; lineHeight: string; weight: number };
    body: { size: string; lineHeight: string; weight: number };
    small: { size: string; lineHeight: string; weight: number };
  };
}

interface FontDefinition {
  family: string;           // "Inter"
  fallback: string[];       // ["system-ui", "sans-serif"]
  weights: number[];        // [400, 500, 600, 700]
  googleFontUrl?: string;   // CDN link
  preview: string;          // Sample text image
  usage: string;            // "Use for headings and emphasis"
  license: string;          // "Open Font License"
}
```

**Typography UI:**
```tsx
<div className="typography-section">
  <h3>Typography System</h3>

  {/* Font Pairings */}
  <div className="font-pairing-grid grid grid-cols-2 gap-6">
    <div className="font-card">
      <div className="font-preview p-6 bg-white rounded-lg">
        <p className="font-display text-4xl font-bold mb-2">
          Heading Font
        </p>
        <p className="text-sm text-zinc-600">{typography.heading.family}</p>
      </div>
      <div className="font-details mt-3">
        <p className="text-sm">Weights: {typography.heading.weights.join(", ")}</p>
        <p className="text-xs text-zinc-400">{typography.heading.usage}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => window.open(typography.heading.googleFontUrl)}
      >
        View on Google Fonts
      </Button>
    </div>

    <div className="font-card">
      <div className="font-preview p-6 bg-white rounded-lg">
        <p className="font-body text-lg">
          Body Font - The quick brown fox jumps over the lazy dog. 
          This is how your body text will look in paragraphs and UI elements.
        </p>
        <p className="text-sm text-zinc-600 mt-2">{typography.body.family}</p>
      </div>
      <div className="font-details mt-3">
        <p className="text-sm">Weights: {typography.body.weights.join(", ")}</p>
        <p className="text-xs text-zinc-400">{typography.body.usage}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => window.open(typography.body.googleFontUrl)}
      >
        View on Google Fonts
      </Button>
    </div>
  </div>

  {/* Type Scale */}
  <div className="type-scale mt-6 p-6 bg-zinc-900/50 rounded-lg">
    <h4>Type Scale</h4>
    <div className="space-y-4 mt-4">
      {Object.entries(typography.scale).map(([tag, styles]) => (
        <div key={tag} className="flex items-baseline gap-4">
          <span className="text-xs text-zinc-500 w-16">{tag.toUpperCase()}</span>
          <span
            className="flex-1 font-display"
            style={{
              fontSize: styles.size,
              lineHeight: styles.lineHeight,
              fontWeight: styles.weight
            }}
          >
            The quick brown fox jumps
          </span>
          <span className="text-xs text-zinc-400">{styles.size}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Export */}
  <div className="typography-export mt-4">
    <Button onClick={exportFontLinks}>Copy Font Links</Button>
    <Button onClick={exportCSS}>Export CSS Variables</Button>
  </div>
</div>
```

#### 4. Icon & Pattern Library
**User Story:** As a product designer, I want consistent icons and patterns so that my brand feels cohesive across touchpoints.

**Assets Generated:**
- Icon set (16-24 icons matching brand style)
- Seamless patterns (backgrounds, textures)
- Decorative elements (dividers, ornaments)
- Social media templates

**Icon UI:**
```tsx
<div className="icon-library">
  <h3>Brand Icon Set</h3>
  <p className="text-sm text-zinc-400 mb-4">
    {iconSet.length} icons in {iconSet[0]?.style || "your"} style
  </p>

  {/* Icon Grid */}
  <div className="icon-grid grid grid-cols-8 gap-4">
    {iconSet.map(icon => (
      <div key={icon.id} className="icon-card">
        <div className="icon-preview bg-zinc-900/50 p-4 rounded-lg">
          <img src={icon.url} alt={icon.name} className="w-full" />
        </div>
        <p className="text-xs text-center mt-2">{icon.name}</p>
        <div className="icon-actions flex gap-1 mt-1">
          <IconButton onClick={() => downloadSVG(icon)}>
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={() => copyToClipboard(icon)}>
            <CopyIcon />
          </IconButton>
        </div>
      </div>
    ))}
  </div>

  {/* Patterns */}
  <div className="pattern-section mt-8">
    <h4>Brand Patterns</h4>
    <div className="pattern-grid grid grid-cols-3 gap-4 mt-4">
      {patterns.map(pattern => (
        <div key={pattern.id} className="pattern-card">
          <div
            className="pattern-preview h-48 rounded-lg"
            style={{ backgroundImage: `url(${pattern.url})` }}
          />
          <p className="text-sm mt-2">{pattern.name}</p>
          <Button size="sm" variant="outline" onClick={() => downloadPattern(pattern)}>
            Download PNG
          </Button>
        </div>
      ))}
    </div>
  </div>
</div>
```

#### 5. Complete Brand Kit Export
**User Story:** As a startup founder, I want all my brand assets in one organized package so that I can share with my team immediately.

**Export Structure:**
```
brand-kit-acme-inc/
├── logos/
│   ├── primary-logo.svg
│   ├── primary-logo.png (transparent)
│   ├── primary-logo-white.svg
│   ├── icon-mark.svg
│   ├── wordmark.svg
│   └── submark.svg
├── colors/
│   ├── palette.json
│   ├── palette.css
│   ├── tailwind.config.js
│   ├── swatches.png
│   └── accessibility-report.pdf
├── typography/
│   ├── font-guide.pdf
│   ├── type-scale.css
│   └── google-fonts.html (import links)
├── icons/
│   ├── svg/ (individual icons)
│   ├── png/ (PNG exports)
│   └── sprite.svg (combined sprite)
├── patterns/
│   ├── pattern-1.png
│   ├── pattern-2.png
│   └── pattern-3.png
├── brand-guide.pdf (complete style guide)
└── README.md (usage instructions)
```

**Export Dialog:**
```tsx
<Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Export Brand Kit</DialogTitle>
      <DialogDescription>
        Download all your brand assets in an organized package
      </DialogDescription>
    </DialogHeader>

    <div className="export-options space-y-4">
      {/* File Formats */}
      <div className="option-group">
        <h4 className="font-semibold mb-2">Logo Formats</h4>
        <div className="grid grid-cols-2 gap-2">
          <Checkbox checked={exportFormats.svg} onChange={v => setFormat("svg", v)}>
            SVG (vector, recommended)
          </Checkbox>
          <Checkbox checked={exportFormats.png} onChange={v => setFormat("png", v)}>
            PNG (transparent)
          </Checkbox>
          <Checkbox checked={exportFormats.jpg} onChange={v => setFormat("jpg", v)}>
            JPG (white background)
          </Checkbox>
          <Checkbox checked={exportFormats.pdf} onChange={v => setFormat("pdf", v)}>
            PDF (print-ready)
          </Checkbox>
        </div>
      </div>

      {/* Resolution */}
      {exportFormats.png && (
        <div className="option-group">
          <h4 className="font-semibold mb-2">PNG Resolution</h4>
          <RadioGroup value={pngResolution} onChange={setPngResolution}>
            <RadioItem value="1x">Standard (1x)</RadioItem>
            <RadioItem value="2x">Retina (2x)</RadioItem>
            <RadioItem value="3x">High-res (3x)</RadioItem>
            <RadioItem value="all">All sizes</RadioItem>
          </RadioGroup>
        </div>
      )}

      {/* Code Formats */}
      <div className="option-group">
        <h4 className="font-semibold mb-2">Color Code Formats</h4>
        <div className="grid grid-cols-2 gap-2">
          <Checkbox checked={codeFormats.css} onChange={v => setCodeFormat("css", v)}>
            CSS Variables
          </Checkbox>
          <Checkbox checked={codeFormats.tailwind} onChange={v => setCodeFormat("tailwind", v)}>
            Tailwind Config
          </Checkbox>
          <Checkbox checked={codeFormats.json} onChange={v => setCodeFormat("json", v)}>
            JSON
          </Checkbox>
          <Checkbox checked={codeFormats.figma} onChange={v => setCodeFormat("figma", v)}>
            Figma Plugin Format
          </Checkbox>
        </div>
      </div>

      {/* Brand Guide */}
      <div className="option-group">
        <Checkbox checked={includeBrandGuide} onChange={setIncludeBrandGuide}>
          <div>
            <p className="font-semibold">Include Brand Guide PDF</p>
            <p className="text-xs text-zinc-400">
              Complete style guide with usage examples (+2 credits)
            </p>
          </div>
        </Checkbox>
      </div>

      {/* Estimated Size */}
      <div className="bg-zinc-900/50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm">Estimated package size:</span>
          <span className="font-semibold">{estimatePackageSize()}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm">Credits required:</span>
          <span className="font-semibold">{calculateCredits()} credits</span>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleExport} disabled={exporting}>
        {exporting ? "Preparing..." : `Export Brand Kit (${calculateCredits()} credits)`}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Should-Have (V2)

#### 6. Brand Consistency Scoring
- Analyze existing brand assets
- Score consistency (color usage, typography, tone)
- Suggest improvements
- Compare against best practices

#### 7. Multi-Brand Management
- Save multiple brand kits
- Switch between brands
- Cross-brand consistency checks
- Team sharing and collaboration

#### 8. Advanced Customization
- Fine-tune individual colors
- Adjust logo details
- Custom icon requests
- Pattern customization

### Nice-to-Have (V3)

#### 9. Brand Evolution
- Version control for brands
- Before/after comparisons
- Gradual brand refresh guidance
- Migration planning

#### 10. Integration Marketplace
- Export to Figma/Sketch
- WordPress theme generation
- Webflow style system export
- Canva template creation

## Database Schema

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
  
  // Color system
  colorPalette  Json     // BrandColorPalette
  
  // Typography
  typography    Json     // BrandTypography
  
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
  
  config        Json     // LogoConfig used to generate
  
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

## Success Criteria

**Launch is successful if:**
1. ✅ 200+ brand kits created in first month
2. ✅ 70%+ completion rate (all sections filled)
3. ✅ 4.3+ star quality rating
4. ✅ 80%+ export rate
5. ✅ <10% refund/complaint rate

**Post-launch (3 months):**
1. ✅ Featured in startup communities
2. ✅ 1,000+ brand kits generated
3. ✅ Integration with Figma/Canva
4. ✅ Published success case studies

---

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Next Review:** Weekly during development
