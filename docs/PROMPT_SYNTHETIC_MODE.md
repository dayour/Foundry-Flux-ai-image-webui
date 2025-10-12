# Implementation Prompt: Synthetic Data & Evaluation Mode

## Context

You are implementing the Synthetic/Eval Mode for Autogen Design, a Next.js 14 AI image generation platform. This mode enables ML engineers, QA testers, and researchers to generate structured synthetic datasets with detailed metadata and ground truth labels.

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
- `models/generation.ts` - Database query functions
- `services/handleImage.ts` - Image processing logic

## Task

Implement the Synthetic/Eval Mode with:
1. Structured metadata input form (demographics, attributes, context)
2. Batch generation with 3 variation modes (random, controlled, sweep)
3. Dataset management (create, organize, statistics, export)
4. Ground truth labeling system
5. Metadata export (JSON, CSV, COCO format)

## Technical Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS for styling
- Radix UI for accessible components
- React Hook Form for metadata forms
- Chart.js for distribution charts

**Backend:**
- Next.js API routes
- Prisma for database operations
- Zod for validation
- JSZip for dataset export
 - GenAIScript for orchestration of large batch jobs (retries, polling, webhooks)

**Database:**
- PostgreSQL via Prisma
- 3 new models: SyntheticDataset, SyntheticImage, BatchGeneration

## File Structure

Create these new files:

```
hooks/
  useSyntheticGeneration.ts    # Batch generation hook
  useDatasetManager.ts         # Dataset CRUD operations

components/
  Synthetic/
    MetadataForm.tsx           # Structured metadata input
    BatchControls.tsx          # Batch size + variation config
    DatasetManager.tsx         # Dataset organization UI
    DatasetStats.tsx           # Distribution charts
    GroundTruthEditor.tsx      # Label annotation
    ExportDialog.tsx           # Export format selection

lib/
  syntheticMetadata.ts         # Metadata helpers
  datasetExport.ts             # ZIP/JSON/CSV/COCO export logic
  syntheticPrompts.ts          # Metadata → prompt conversion

app/api/
  synthetic/
    generate-batch/
      route.ts                 # Batch generation endpoint
    datasets/
      route.ts                 # List/create datasets
      [id]/
        route.ts               # Dataset CRUD
        export/
          route.ts             # Dataset export

models/
  syntheticDataset.ts          # Database queries
  syntheticImage.ts            # Image queries
```

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model SyntheticDataset {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  description   String?
  category      String   @default("training") // "training", "validation", "test", "eval"
  tags          String[]
  version       Int      @default(1)
  
  images        SyntheticImage[]
  totalImages   Int      @default(0)
  
  // Statistics (JSON)
  statistics    Json?
  
  // Export
  exportFormats String[]  @default([])
  lastExportUrl String?
  lastExportAt  DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([category])
}

model SyntheticImage {
  id            String   @id @default(cuid())
  datasetId     String?
  dataset       SyntheticDataset? @relation(fields: [datasetId], references: [id], onDelete: SetNull)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Image data
  imageUrl      String
  thumbnailUrl  String?
  width         Int
  height        Int
  fileSize      Int
  
  // Synthetic metadata
  assetType     String   // "person", "place", "object", "scenario"
  displayName   String
  metadata      Json     // Full SyntheticAssetMetadata
  
  // Ground truth
  groundTruth   Json?    // GroundTruth labels
  
  // Organization
  tags          String[]
  
  // Analytics
  downloads     Int      @default(0)
  
  createdAt     DateTime @default(now())
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([datasetId])
  @@index([assetType])
}

model BatchGeneration {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  datasetId       String?
  dataset         SyntheticDataset? @relation(fields: [datasetId], references: [id], onDelete: SetNull)
  
  batchSize       Int
  completed       Int      @default(0)
  failed          Int      @default(0)
  
  config          Json     // BatchGenerationConfig
  status          String   @default("queued") // "queued", "processing", "completed", "failed", "paused"
  
  creditsUsed     Int
  
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  
  @@index([userId, status])
  @@index([userId, createdAt(sort: Desc)])
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_synthetic_mode
npx prisma generate
```

## Type Definitions

Add to `components/Generator/types.ts`:

```typescript
export interface SyntheticAssetMetadata {
  // Core
  assetType: "person" | "place" | "object" | "memory" | "scenario";
  displayName: string;
  
  // Demographics (for people)
  age?: number | [number, number];
  gender?: "male" | "female" | "non-binary" | "any";
  ethnicity?: string[];
  
  // Physical attributes
  attire?: string;
  accessories?: string[];
  hairStyle?: string;
  hairColor?: string;
  bodyType?: string;
  
  // Context
  location?: string;
  era?: string;
  lighting?: "natural" | "studio" | "low-light" | "harsh" | "soft";
  mood?: string;
  environment?: "indoor" | "outdoor" | "urban" | "rural";
  
  // Composition
  pose?: string;
  angle?: string;
  background?: string;
  
  // Quality
  resolution?: "standard" | "high" | "ultra";
  style?: "realistic" | "stylized" | "artistic";
  
  // Evaluation
  groundTruth?: GroundTruth;
  tags?: string[];
  notes?: string;
}

export interface GroundTruth {
  primaryClass: string;
  secondaryClasses?: string[];
  
  boundingBoxes?: Array<{
    class: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  
  attributes: Record<string, any>;
  
  keypoints?: Array<{
    name: string;
    x: number;
    y: number;
    visibility: number;
  }>;
  
  customLabels?: Record<string, any>;
}

export interface BatchGenerationConfig {
  batchSize: number;
  variationType: "random" | "controlled" | "sweep";
  
  randomConfig?: {
    variationStrength: number;
  };
  
  controlledConfig?: {
    varyAttributes: string[];
    keepConstant: string[];
  };
  
  sweepConfig?: {
    attribute: string;
    values: any[];
  };
  
  baseMetadata: SyntheticAssetMetadata;
  datasetId?: string;
}
```

## Component Implementation

### 1. MetadataForm Component

**File:** `components/Synthetic/MetadataForm.tsx`

```typescript
"use client";

import { useState } from "react";
import { SyntheticAssetMetadata } from "@/components/Generator/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";

interface MetadataFormProps {
  metadata: SyntheticAssetMetadata;
  onChange: (metadata: SyntheticAssetMetadata) => void;
}

const ETHNICITY_OPTIONS = [
  "Asian", "Black", "Hispanic", "White", "Middle Eastern", 
  "South Asian", "Pacific Islander", "Native American", "Mixed"
];

export function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  const updateField = <K extends keyof SyntheticAssetMetadata>(
    field: K,
    value: SyntheticAssetMetadata[K]
  ) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
      {/* Asset Type */}
      <div className="space-y-2">
        <Label>Asset Type</Label>
        <Select
          value={metadata.assetType}
          onValueChange={(value: any) => updateField("assetType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="person">Person</SelectItem>
            <SelectItem value="place">Place</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="memory">Memory/Scene</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label>Display Name</Label>
        <Input
          value={metadata.displayName}
          onChange={(e) => updateField("displayName", e.target.value)}
          placeholder="e.g., Professional Woman, Modern Office, Vintage Car"
        />
      </div>

      {/* Person-specific fields */}
      {metadata.assetType === "person" && (
        <>
          {/* Age */}
          <div className="space-y-2">
            <Label>Age</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Single age"
                className="flex-1"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateField("age", isNaN(val) ? undefined : val);
                }}
              />
              <span className="text-sm text-zinc-400">or range:</span>
              <Input
                type="number"
                placeholder="Min"
                className="flex-1"
                onChange={(e) => {
                  const min = parseInt(e.target.value);
                  const current = metadata.age;
                  if (Array.isArray(current)) {
                    updateField("age", [isNaN(min) ? 0 : min, current[1]]);
                  } else {
                    updateField("age", [isNaN(min) ? 0 : min, 100]);
                  }
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="flex-1"
                onChange={(e) => {
                  const max = parseInt(e.target.value);
                  const current = metadata.age;
                  if (Array.isArray(current)) {
                    updateField("age", [current[0], isNaN(max) ? 100 : max]);
                  } else {
                    updateField("age", [0, isNaN(max) ? 100 : max]);
                  }
                }}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={metadata.gender || "any"}
              onValueChange={(value: any) => updateField("gender", value)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-binary" id="non-binary" />
                  <Label htmlFor="non-binary">Non-binary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any" />
                  <Label htmlFor="any">Any</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Ethnicity */}
          <div className="space-y-2">
            <Label>Ethnicity (Multi-select)</Label>
            <TagInput
              tags={metadata.ethnicity || []}
              onChange={(tags) => updateField("ethnicity", tags)}
              suggestions={ETHNICITY_OPTIONS}
              placeholder="Add ethnicity..."
            />
          </div>

          {/* Attire */}
          <div className="space-y-2">
            <Label>Attire</Label>
            <Input
              value={metadata.attire || ""}
              onChange={(e) => updateField("attire", e.target.value)}
              placeholder="e.g., Business casual, Athletic wear, Formal dress"
            />
          </div>

          {/* Accessories */}
          <div className="space-y-2">
            <Label>Accessories</Label>
            <TagInput
              tags={metadata.accessories || []}
              onChange={(tags) => updateField("accessories", tags)}
              placeholder="Add accessory (Glasses, Hat, Jewelry...)"
            />
          </div>

          {/* Hair */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hair Style</Label>
              <Input
                value={metadata.hairStyle || ""}
                onChange={(e) => updateField("hairStyle", e.target.value)}
                placeholder="e.g., Short curly, Long straight"
              />
            </div>
            <div className="space-y-2">
              <Label>Hair Color</Label>
              <Input
                value={metadata.hairColor || ""}
                onChange={(e) => updateField("hairColor", e.target.value)}
                placeholder="e.g., Brown, Blonde, Black"
              />
            </div>
          </div>
        </>
      )}

      {/* Context (all asset types) */}
      <div className="space-y-2">
        <Label>Location/Setting</Label>
        <Input
          value={metadata.location || ""}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="e.g., Modern office, City park, Studio"
        />
      </div>

      <div className="space-y-2">
        <Label>Lighting</Label>
        <Select
          value={metadata.lighting || "natural"}
          onValueChange={(value: any) => updateField("lighting", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="natural">Natural daylight</SelectItem>
            <SelectItem value="studio">Studio lighting</SelectItem>
            <SelectItem value="low-light">Low light / Evening</SelectItem>
            <SelectItem value="harsh">Harsh / Direct sun</SelectItem>
            <SelectItem value="soft">Soft / Diffused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (for organization)</Label>
        <TagInput
          tags={metadata.tags || []}
          onChange={(tags) => updateField("tags", tags)}
          placeholder="Add tag (test-set, diverse, edge-case...)"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          rows={3}
          value={metadata.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Additional context or requirements..."
        />
      </div>
    </div>
  );
}
```

### 2. BatchControls Component

**File:** `components/Synthetic/BatchControls.tsx`

```typescript
"use client";

import { useState } from "react";
import { BatchGenerationConfig } from "@/components/Generator/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";

interface BatchControlsProps {
  config: BatchGenerationConfig;
  onChange: (config: BatchGenerationConfig) => void;
  onGenerate: () => void;
  generating: boolean;
  creditsPerImage: number;
}

export function BatchControls({ 
  config, 
  onChange, 
  onGenerate, 
  generating,
  creditsPerImage 
}: BatchControlsProps) {
  const updateConfig = <K extends keyof BatchGenerationConfig>(
    field: K,
    value: BatchGenerationConfig[K]
  ) => {
    onChange({ ...config, [field]: value });
  };

  const totalCredits = config.batchSize * creditsPerImage;
  const estimatedCost = (totalCredits * 0.10).toFixed(2);

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold">Batch Generation</h3>

      {/* Batch Size */}
      <div className="space-y-2">
        <Label>Batch Size</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={config.batchSize}
          onChange={(e) => updateConfig("batchSize", parseInt(e.target.value) || 1)}
        />
        <p className="text-sm text-zinc-400">
          Cost: {totalCredits} credits (~${estimatedCost})
        </p>
      </div>

      {/* Variation Type */}
      <div className="space-y-2">
        <Label>Variation Type</Label>
        <Select
          value={config.variationType}
          onValueChange={(value: any) => updateConfig("variationType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random variations</SelectItem>
            <SelectItem value="controlled">Controlled variations</SelectItem>
            <SelectItem value="sweep">Parameter sweep</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Random Config */}
      {config.variationType === "random" && (
        <div className="space-y-2">
          <Label>Variation Strength: {config.randomConfig?.variationStrength || 50}%</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[config.randomConfig?.variationStrength || 50]}
            onValueChange={([value]) => {
              updateConfig("randomConfig", { variationStrength: value });
            }}
          />
          <p className="text-xs text-zinc-400">
            0% = Nearly identical | 100% = Maximum diversity
          </p>
        </div>
      )}

      {/* Controlled Config */}
      {config.variationType === "controlled" && (
        <>
          <div className="space-y-2">
            <Label>Vary These Attributes</Label>
            <TagInput
              tags={config.controlledConfig?.varyAttributes || []}
              onChange={(tags) => {
                updateConfig("controlledConfig", {
                  ...config.controlledConfig,
                  varyAttributes: tags,
                  keepConstant: config.controlledConfig?.keepConstant || []
                });
              }}
              suggestions={["age", "lighting", "pose", "angle", "gender", "ethnicity"]}
              placeholder="Add attribute to vary..."
            />
          </div>
          <div className="space-y-2">
            <Label>Keep Constant</Label>
            <TagInput
              tags={config.controlledConfig?.keepConstant || []}
              onChange={(tags) => {
                updateConfig("controlledConfig", {
                  ...config.controlledConfig,
                  varyAttributes: config.controlledConfig?.varyAttributes || [],
                  keepConstant: tags
                });
              }}
              suggestions={["age", "lighting", "pose", "angle", "gender", "ethnicity"]}
              placeholder="Add attribute to keep constant..."
            />
          </div>
        </>
      )}

      {/* Sweep Config */}
      {config.variationType === "sweep" && (
        <>
          <div className="space-y-2">
            <Label>Sweep Attribute</Label>
            <Select
              value={config.sweepConfig?.attribute || "age"}
              onValueChange={(value) => {
                updateConfig("sweepConfig", {
                  attribute: value,
                  values: config.sweepConfig?.values || []
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="lighting">Lighting</SelectItem>
                <SelectItem value="pose">Pose</SelectItem>
                <SelectItem value="angle">Camera Angle</SelectItem>
                <SelectItem value="gender">Gender</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Values (one per image)</Label>
            <TagInput
              tags={config.sweepConfig?.values?.map(String) || []}
              onChange={(tags) => {
                updateConfig("sweepConfig", {
                  attribute: config.sweepConfig?.attribute || "age",
                  values: tags
                });
              }}
              placeholder="Add value (e.g., 20, 30, 40)"
            />
            <p className="text-xs text-zinc-400">
              {config.sweepConfig?.values?.length || 0} values = {config.sweepConfig?.values?.length || 0} images
            </p>
          </div>
        </>
      )}

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={generating || config.batchSize < 1}
        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
      >
        {generating ? (
          <>Generating {config.batchSize} images...</>
        ) : (
          <>Generate {config.batchSize} Images ({totalCredits} credits)</>
        )}
      </Button>
    </div>
  );
}
```

### 3. useSyntheticGeneration Hook

**File:** `hooks/useSyntheticGeneration.ts`

```typescript
import { useState, useCallback } from "react";
import { BatchGenerationConfig, SyntheticAssetMetadata } from "@/components/Generator/types";
import to from "await-to-js";

interface UseSyntheticGenerationReturn {
  generating: boolean;
  progress: number;
  completed: number;
  failed: number;
  error: string | null;
  generateBatch: (config: BatchGenerationConfig) => Promise<void>;
  reset: () => void;
}

export function useSyntheticGeneration(): UseSyntheticGenerationReturn {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [failed, setFailed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateBatch = useCallback(async (config: BatchGenerationConfig) => {
    setGenerating(true);
    setProgress(0);
    setCompleted(0);
    setFailed(0);
    setError(null);

    const [err, response] = await to(
      fetch("/api/synthetic/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      })
    );

    if (err || !response?.ok) {
      const errorData = await response?.json().catch(() => ({}));
      setError(errorData.error || "Batch generation failed");
      setGenerating(false);
      return;
    }

    const data = await response.json();
    const batchId = data.batchId;

    // Poll for progress
    const pollInterval = setInterval(async () => {
      const [pollErr, pollResponse] = await to(
        fetch(`/api/synthetic/batch-status/${batchId}`)
      );

      if (pollErr || !pollResponse?.ok) {
        clearInterval(pollInterval);
        setError("Failed to check batch status");
        setGenerating(false);
        return;
      }

      const status = await pollResponse.json();
      setCompleted(status.completed);
      setFailed(status.failed);
      setProgress((status.completed + status.failed) / status.total * 100);

      if (status.status === "completed" || status.status === "failed") {
        clearInterval(pollInterval);
        setGenerating(false);
      }
    }, 2000);
  }, []);

  const reset = useCallback(() => {
    setGenerating(false);
    setProgress(0);
    setCompleted(0);
    setFailed(0);
    setError(null);
  }, []);

  return {
    generating,
    progress,
    completed,
    failed,
    error,
    generateBatch,
    reset
  };
}
```

## API Implementation

### Batch Generation Route

**File:** `app/api/synthetic/generate-batch/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { BatchGenerationConfig } from "@/components/Generator/types";
import { z } from "zod";

const BatchConfigSchema = z.object({
  batchSize: z.number().min(1).max(100),
  variationType: z.enum(["random", "controlled", "sweep"]),
  baseMetadata: z.object({
    assetType: z.enum(["person", "place", "object", "memory", "scenario"]),
    displayName: z.string(),
  }).passthrough(),
  datasetId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = BatchConfigSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Invalid request", 
      details: validation.error 
    }, { status: 400 });
  }

  const config: BatchGenerationConfig = validation.data as BatchGenerationConfig;
  const creditsPerImage = 1; // Adjust based on resolution
  const totalCredits = config.batchSize * creditsPerImage;

  // Check user credits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true }
  });

  if (!user || user.credits < totalCredits) {
    return NextResponse.json({ 
      error: "Insufficient credits",
      required: totalCredits,
      available: user?.credits || 0
    }, { status: 402 });
  }

  // Create batch record
  const batch = await prisma.batchGeneration.create({
    data: {
      userId: session.user.id,
      datasetId: config.datasetId,
      batchSize: config.batchSize,
      config: config as any,
      status: "queued",
      creditsUsed: totalCredits,
    }
  });

  // Deduct credits upfront
  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: totalCredits } }
  });

  // Start batch processing (background job)
  processBatch(batch.id, config, session.user.id).catch(console.error);

  return NextResponse.json({ 
    batchId: batch.id,
    creditsUsed: totalCredits 
  });
}

async function processBatch(
  batchId: string, 
  config: BatchGenerationConfig, 
  userId: string
) {
  await prisma.batchGeneration.update({
    where: { id: batchId },
    data: { status: "processing" }
  });

  for (let i = 0; i < config.batchSize; i++) {
    try {
      // Generate variation metadata
      const variedMetadata = applyVariation(config, i);
      
      // Convert metadata to prompt
      const prompt = metadataToPrompt(variedMetadata);
      
      // Call Azure Flux API (reuse existing logic)
      const imageUrl = await generateImage(prompt);
      
      // Save to database
      await prisma.syntheticImage.create({
        data: {
          userId,
          datasetId: config.datasetId,
          imageUrl,
          width: 1024,
          height: 1024,
          fileSize: 0, // TODO: get actual size
          assetType: variedMetadata.assetType,
          displayName: variedMetadata.displayName,
          metadata: variedMetadata as any,
          groundTruth: variedMetadata.groundTruth as any,
          tags: variedMetadata.tags || [],
        }
      });

      // Update batch progress
      await prisma.batchGeneration.update({
        where: { id: batchId },
        data: { completed: { increment: 1 } }
      });

    } catch (error) {
      console.error(`Batch ${batchId} image ${i} failed:`, error);
      await prisma.batchGeneration.update({
        where: { id: batchId },
        data: { failed: { increment: 1 } }
      });
    }
  }

  // Mark batch complete
  await prisma.batchGeneration.update({
    where: { id: batchId },
    data: { 
      status: "completed",
      completedAt: new Date()
    }
  });

  // Update dataset statistics
  if (config.datasetId) {
    await updateDatasetStats(config.datasetId);
  }
}

function applyVariation(config: BatchGenerationConfig, index: number) {
  const base = { ...config.baseMetadata };

  if (config.variationType === "random") {
    // Random variations
    const strength = config.randomConfig?.variationStrength || 50;
    // TODO: Apply random changes based on strength
  } else if (config.variationType === "controlled") {
    // Controlled variations
    const varyAttrs = config.controlledConfig?.varyAttributes || [];
    // TODO: Vary only specified attributes
  } else if (config.variationType === "sweep") {
    // Parameter sweep
    const attr = config.sweepConfig?.attribute;
    const values = config.sweepConfig?.values || [];
    if (attr && values[index]) {
      (base as any)[attr] = values[index];
    }
  }

  return base;
}

function metadataToPrompt(metadata: any): string {
  let prompt = "";
  
  if (metadata.assetType === "person") {
    const parts = [];
    
    if (metadata.age) {
      const age = Array.isArray(metadata.age) 
        ? `${metadata.age[0]}-${metadata.age[1]} year old`
        : `${metadata.age} year old`;
      parts.push(age);
    }
    
    if (metadata.gender && metadata.gender !== "any") {
      parts.push(metadata.gender);
    }
    
    if (metadata.ethnicity?.length) {
      parts.push(metadata.ethnicity.join(" and "));
    }
    
    parts.push("person");
    
    if (metadata.attire) {
      parts.push(`wearing ${metadata.attire}`);
    }
    
    if (metadata.accessories?.length) {
      parts.push(`with ${metadata.accessories.join(", ")}`);
    }
    
    if (metadata.location) {
      parts.push(`in ${metadata.location}`);
    }
    
    if (metadata.lighting) {
      parts.push(`${metadata.lighting} lighting`);
    }
    
    if (metadata.pose) {
      parts.push(`${metadata.pose} shot`);
    }
    
    prompt = parts.join(", ");
  } else {
    // Fallback for other asset types
    prompt = metadata.displayName;
    if (metadata.location) prompt += `, ${metadata.location}`;
    if (metadata.lighting) prompt += `, ${metadata.lighting} lighting`;
  }
  
  return prompt;
}

async function generateImage(prompt: string): Promise<string> {
  // TODO: Integrate with existing Azure Flux generation logic
  // This is a placeholder - reuse code from app/api/predictions/route.ts
  return "https://placeholder.com/image.jpg";
}

async function updateDatasetStats(datasetId: string) {
  const images = await prisma.syntheticImage.findMany({
    where: { datasetId },
    select: { metadata: true }
  });

  // Calculate statistics
  const stats = {
    demographics: {
      ageDistribution: {},
      genderDistribution: {},
      ethnicityDistribution: {},
    },
    attributes: {
      lightingTypes: {},
      poses: {},
      locations: {},
    }
  };

  images.forEach((img: any) => {
    const metadata = img.metadata;
    
    // Count demographics
    if (metadata.age) {
      const ageGroup = getAgeGroup(metadata.age);
      stats.demographics.ageDistribution[ageGroup] = 
        (stats.demographics.ageDistribution[ageGroup] || 0) + 1;
    }
    
    if (metadata.gender) {
      stats.demographics.genderDistribution[metadata.gender] = 
        (stats.demographics.genderDistribution[metadata.gender] || 0) + 1;
    }
    
    // ... more statistics
  });

  await prisma.syntheticDataset.update({
    where: { id: datasetId },
    data: { 
      statistics: stats as any,
      totalImages: images.length
    }
  });
}

function getAgeGroup(age: number | [number, number]): string {
  const avgAge = Array.isArray(age) ? (age[0] + age[1]) / 2 : age;
  if (avgAge < 18) return "0-17";
  if (avgAge < 30) return "18-29";
  if (avgAge < 50) return "30-49";
  if (avgAge < 65) return "50-64";
  return "65+";
}
```

## Integration with ImageGenerator

Update `components/Generator/ImageGenerator.tsx`:

```typescript
// Add import
import { MetadataForm } from "@/components/Synthetic/MetadataForm";
import { BatchControls } from "@/components/Synthetic/BatchControls";
import { useSyntheticGeneration } from "@/hooks/useSyntheticGeneration";

// Inside component
const syntheticGen = useSyntheticGeneration();
const [syntheticMetadata, setSyntheticMetadata] = useState<SyntheticAssetMetadata>({
  assetType: "person",
  displayName: "",
});
const [batchConfig, setBatchConfig] = useState<BatchGenerationConfig>({
  batchSize: 10,
  variationType: "random",
  randomConfig: { variationStrength: 50 },
  baseMetadata: syntheticMetadata,
});

// In render, add conditional for synthetic mode
{generationMode === "synthetic" && (
  <div className="space-y-6">
    <MetadataForm
      metadata={syntheticMetadata}
      onChange={setSyntheticMetadata}
    />
    
    <BatchControls
      config={{ ...batchConfig, baseMetadata: syntheticMetadata }}
      onChange={setBatchConfig}
      onGenerate={() => syntheticGen.generateBatch({ ...batchConfig, baseMetadata: syntheticMetadata })}
      generating={syntheticGen.generating}
      creditsPerImage={1}
    />
    
    {syntheticGen.generating && (
      <div className="p-4 bg-zinc-900/50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Progress</span>
          <span>{syntheticGen.progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
            style={{ width: `${syntheticGen.progress}%` }}
          />
        </div>
        <p className="text-sm text-zinc-400 mt-2">
          Completed: {syntheticGen.completed} | Failed: {syntheticGen.failed}
        </p>
      </div>
    )}
  </div>
)}
```

## Styling

Match existing dark theme with gradients:

```css
/* Add to globals.css */
.synthetic-metadata-form {
  @apply space-y-4 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800;
}

.tag-input {
  @apply flex flex-wrap gap-2 p-2 bg-zinc-800 rounded-md border border-zinc-700;
}

.tag-item {
  @apply inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-md text-sm;
}

.dataset-stats .stat-card {
  @apply p-4 bg-zinc-900/50 rounded-lg border border-zinc-800;
}

.progress-bar-gradient {
  @apply bg-gradient-to-r from-purple-500 to-cyan-500;
}
```

## Testing Checklist

- [ ] Metadata form renders all fields correctly
- [ ] Age input supports both single value and range
- [ ] Ethnicity multi-select works
- [ ] Batch size validates (1-100)
- [ ] Random variation strength slider updates
- [ ] Controlled variation attribute selection works
- [ ] Parameter sweep generates correct number of images
- [ ] Credit calculation is accurate
- [ ] Batch generation creates database records
- [ ] Progress polling updates UI in real-time
- [ ] Failed images don't stop entire batch
- [ ] Dataset statistics calculate correctly
- [ ] Metadata → prompt conversion is logical
- [ ] Export formats (JSON, CSV) work
- [ ] Ground truth labels are preserved

## Success Criteria

1. ✅ Users can specify detailed metadata (10+ attributes)
2. ✅ Batch generation supports 1-100 images
3. ✅ 3 variation modes (random, controlled, sweep) work correctly
4. ✅ Progress tracking updates in real-time
5. ✅ Dataset statistics calculate automatically
6. ✅ Metadata exports in JSON/CSV format
7. ✅ UI matches existing dark theme

## Timeline

- **Day 1:** Database schema + migration
- **Day 2:** MetadataForm + BatchControls components
- **Day 3:** useSyntheticGeneration hook + API routes
- **Day 4:** Dataset management + statistics
- **Day 5:** Export functionality (JSON/CSV/COCO)
- **Day 6:** Testing + refinement

## Deliverables

1. ✅ Working batch generation system
2. ✅ Metadata form with 15+ configurable fields
3. ✅ 3 variation modes implemented
4. ✅ Dataset statistics dashboard
5. ✅ Export in 3+ formats
6. ✅ Documentation updates

---

**Copy this entire prompt into a new chat window to implement Synthetic/Eval Mode.**
