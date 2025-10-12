# Implementation Prompt: Engineering & Technical Diagram Mode

## Context

You are implementing the Engineering Mode for Autogen Design, a Next.js 14 AI image generation platform. This mode enables engineers, architects, and technical professionals to generate CAD drawings, system diagrams, network topologies, circuit schematics, UML diagrams, and architectural blueprints using AI.

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

Implement the Engineering Mode with:
1. Diagram type selection (12+ types across 6 categories)
2. Text-to-diagram generation with example prompts
3. Structured element editor for advanced users
4. Annotation system (dimensions, labels, callouts)
5. Multi-format export (SVG, PNG, PDF, DXF, VSDX)

## Technical Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS + custom CSS for technical styling
- Radix UI for dialogs and selects
- React Hook Form for configurations
- Konva.js for interactive diagram editing
- Fabric.js for annotation overlays

**Backend:**
- Next.js API routes
- Prisma for database
- Sharp for image processing
- svg2pdf for PDF conversion
- makerjs for DXF generation
 - GenAIScript for orchestrating multi-step diagram generation and export pipelines (polling, retries, webhooks)

**Third-Party:**
- PlantUML for UML diagram generation
- D3.js for network topology visualization (optional)

## File Structure

Create these new files:

```
hooks/
  useEngineeringDiagram.ts      # Diagram state management
  useAnnotations.ts             # Annotation system

components/
  Engineering/
    DiagramTypeSelector.tsx     # Type selection UI
    DiagramDescriptionInput.tsx # Text input with examples
    StructuredEditor.tsx        # Element-based editor
    DiagramPreview.tsx          # Preview with annotations
    AnnotationToolbar.tsx       # Dimension/label tools
    ExportDialog.tsx            # Multi-format export
    SymbolLibrary.tsx           # Standard symbols

lib/
  diagramPrompts.ts             # Text → prompt conversion
  diagramExport.ts              # Multi-format export logic
  diagramSymbols.ts             # Standard symbol libraries
  dxfConverter.ts               # SVG → DXF conversion

app/api/
  engineering/
    generate/
      route.ts                  # Diagram generation
    export/
      route.ts                  # Format conversion

GenAIScript example (diagram workflow):

```genaiscript
workflow "diagram_pipeline" {
  input { description: string; type: string }
  step "generate" using provider.diagram.create { prompt = input.description; type = input.type }
  step "export_svg" using provider.diagram.export { job_id = generate.id; format = "svg" }
  step "export_pdf" using provider.diagram.export { job_id = generate.id; format = "pdf" }
  output { svg = export_svg.output.url; pdf = export_pdf.output.url }
}
```

models/
  engineeringDiagram.ts         # Database queries
```

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model EngineeringDiagram {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  type          String   // "microservices", "topology", "schematic", etc.
  category      String   // "system", "network", "circuit", etc.
  
  description   String   @db.Text
  
  // Structure (JSON)
  elements      Json?    // DiagramElement[]
  annotations   Json?    // Annotation[]
  
  // Configuration (JSON)
  config        Json     // DiagramConfig
  
  // Output URLs
  imageUrl      String
  svgUrl        String?
  dxfUrl        String?
  pdfUrl        String?
  
  // Metadata
  version       Int      @default(1)
  tags          String[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([type])
  @@index([category])
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_engineering_mode
npx prisma generate
```

## Type Definitions

Add to `components/Generator/types.ts`:

```typescript
export interface DiagramConfig {
  type: string;                  // "microservices", "topology", etc.
  category: string;              // "system", "network", etc.
  description: string;
  elements?: DiagramElement[];
  style: "technical" | "schematic" | "blueprint" | "modern" | "minimal";
  annotations: boolean;
  scale?: string;
  units?: "metric" | "imperial";
}

export interface DiagramElement {
  id: string;
  type: string;                  // "server", "router", "resistor", "room"
  label: string;
  properties?: Record<string, any>;
  position?: { x: number; y: number };
  connections?: string[];        // IDs of connected elements
}

export interface Annotation {
  id: string;
  type: "dimension" | "label" | "note" | "callout" | "symbol";
  position: { x: number; y: number };
  text: string;
  value?: number;
  unit?: string;
  style?: {
    fontSize: number;
    color: string;
    arrowStyle?: "single" | "double" | "none";
  };
}

export interface DiagramType {
  category: "system" | "network" | "circuit" | "flowchart" | "architecture" | "cad";
  subcategory: string;
  description: string;
  outputFormat: string[];
  icon: React.ComponentType;
}
```

## Component Implementation

### 1. DiagramTypeSelector Component

**File:** `components/Engineering/DiagramTypeSelector.tsx`

```typescript
"use client";

import { useState } from "react";
import { DiagramType } from "@/components/Generator/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Network, 
  CircuitBoard, 
  GitBranch, 
  Home, 
  Box, 
  Workflow 
} from "lucide-react";

const DIAGRAM_TYPES: DiagramType[] = [
  // System Architecture
  {
    category: "system",
    subcategory: "microservices",
    description: "Microservices architecture with services, APIs, databases",
    outputFormat: ["svg", "png", "pdf"],
    icon: GitBranch
  },
  {
    category: "system",
    subcategory: "data-flow",
    description: "Data flow diagram (DFD) showing information movement",
    outputFormat: ["svg", "png", "pdf"],
    icon: Workflow
  },
  
  // Network
  {
    category: "network",
    subcategory: "topology",
    description: "Network topology (star, mesh, hybrid)",
    outputFormat: ["svg", "png", "pdf", "vsdx"],
    icon: Network
  },
  {
    category: "network",
    subcategory: "rack-diagram",
    description: "Server rack layout and cable management",
    outputFormat: ["svg", "png", "pdf"],
    icon: Box
  },
  
  // Circuit
  {
    category: "circuit",
    subcategory: "schematic",
    description: "Electronic circuit schematic with components",
    outputFormat: ["svg", "png", "pdf", "dxf"],
    icon: CircuitBoard
  },
  {
    category: "circuit",
    subcategory: "pcb-layout",
    description: "PCB layout (top view, component placement)",
    outputFormat: ["svg", "png", "pdf", "gerber"],
    icon: CircuitBoard
  },
  
  // Flowchart
  {
    category: "flowchart",
    subcategory: "process",
    description: "Business process flowchart",
    outputFormat: ["svg", "png", "pdf"],
    icon: Workflow
  },
  {
    category: "flowchart",
    subcategory: "uml",
    description: "UML diagrams (class, sequence, activity)",
    outputFormat: ["svg", "png", "pdf", "plantuml"],
    icon: GitBranch
  },
  
  // Architecture
  {
    category: "architecture",
    subcategory: "floorplan",
    description: "Architectural floor plan",
    outputFormat: ["svg", "png", "pdf", "dxf"],
    icon: Home
  },
  {
    category: "architecture",
    subcategory: "isometric",
    description: "Isometric technical drawing",
    outputFormat: ["svg", "png", "pdf"],
    icon: Box
  },
  
  // CAD
  {
    category: "cad",
    subcategory: "mechanical",
    description: "Mechanical part drawing with dimensions",
    outputFormat: ["svg", "png", "pdf", "dxf", "step"],
    icon: Box
  },
  {
    category: "cad",
    subcategory: "assembly",
    description: "Assembly drawing (exploded view)",
    outputFormat: ["svg", "png", "pdf", "dxf"],
    icon: Box
  },
];

const CATEGORIES = ["system", "network", "circuit", "flowchart", "architecture", "cad"];

interface DiagramTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function DiagramTypeSelector({ selectedType, onSelectType }: DiagramTypeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("system");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Diagram Type</h3>
        
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={cn(
                "px-4 py-2 rounded-lg capitalize transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700"
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Diagram Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIAGRAM_TYPES
            .filter(d => d.category === selectedCategory)
            .map(diagram => {
              const Icon = diagram.icon;
              return (
                <button
                  key={diagram.subcategory}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    selectedType === diagram.subcategory
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  )}
                  onClick={() => onSelectType(diagram.subcategory)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold capitalize mb-1">
                        {diagram.subcategory.replace(/-/g, " ")}
                      </h4>
                      <p className="text-xs text-zinc-400">{diagram.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    {diagram.outputFormat.map(format => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
```

### 2. DiagramDescriptionInput Component

**File:** `components/Engineering/DiagramDescriptionInput.tsx`

```typescript
"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb } from "lucide-react";

const EXAMPLE_PROMPTS: Record<string, string[]> = {
  "microservices": [
    "API Gateway connecting to 3 microservices (Auth, Orders, Payments), each with its own PostgreSQL database",
    "Event-driven architecture with RabbitMQ message queue, 4 services, and Redis cache layer",
    "Kubernetes cluster with 2 namespaces (prod, staging), ingress controller, and 5 pods per namespace"
  ],
  "topology": [
    "Corporate network: firewall, core switch, 3 access switches, 20 workstations in different VLANs",
    "Home network: cable modem, WiFi router, mesh access point, 5 wireless devices (laptops, phones, IoT)",
    "Data center: redundant routers, multiple VLANs, load balancer, firewall cluster"
  ],
  "schematic": [
    "555 timer circuit in astable mode with LED blinker output, 2 resistors and 2 capacitors",
    "Arduino Uno with DHT22 temperature sensor and 16x2 LCD display, powered by 9V battery",
    "Regulated power supply: AC 120V input, bridge rectifier, 7805 voltage regulator, filter capacitors"
  ],
  "floorplan": [
    "2-bedroom apartment: open living/kitchen area, 2 bedrooms, 1 bathroom, balcony, 900 sq ft total",
    "Small office: reception area, 3 private offices, conference room, kitchenette, restroom",
    "Retail store: entrance, checkout counter, 4 product display sections, fitting rooms, stockroom"
  ],
  "mechanical": [
    "L-bracket with 4 mounting holes (6mm diameter), overall dimensions 100mm x 50mm x 5mm thickness",
    "Cylindrical shaft with keyway, 20mm diameter, 150mm length, 5mm x 5mm keyway",
    "Rectangular housing with M6 threaded bore and 4-bolt mounting flange"
  ],
  "process": [
    "Customer order fulfillment: receive order → validate payment → check inventory → pack items → ship → confirm delivery",
    "Employee onboarding: submit application → HR review → interview → background check → job offer → start date",
    "Software deployment: code commit → build → test → staging deploy → approval → production deploy"
  ]
};

interface DiagramDescriptionInputProps {
  diagramType: string;
  description: string;
  style: string;
  annotations: boolean;
  units: string;
  onDescriptionChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onAnnotationsChange: (value: boolean) => void;
  onUnitsChange: (value: string) => void;
  showUnits?: boolean;
}

export function DiagramDescriptionInput({
  diagramType,
  description,
  style,
  annotations,
  units,
  onDescriptionChange,
  onStyleChange,
  onAnnotationsChange,
  onUnitsChange,
  showUnits = false
}: DiagramDescriptionInputProps) {
  const examples = EXAMPLE_PROMPTS[diagramType] || [];

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <div>
        <Label className="text-base font-semibold mb-2">Describe Your Diagram</Label>
        <p className="text-sm text-zinc-400 mb-3">
          Provide a detailed description of what you want to create. Be specific about components, connections, and layout.
        </p>
        
        <Textarea
          rows={6}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={`Example: ${examples[0] || "Describe your diagram here..."}`}
          className="font-mono text-sm"
        />
      </div>

      {/* Example Prompts */}
      {examples.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <Label className="text-sm">Example Prompts</Label>
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => onDescriptionChange(example)}
                className="w-full text-left p-3 text-sm bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visual Style */}
      <div>
        <Label>Visual Style</Label>
        <Select value={style} onValueChange={onStyleChange}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technical">Technical (black & white, precise)</SelectItem>
            <SelectItem value="schematic">Schematic (standard symbols)</SelectItem>
            <SelectItem value="blueprint">Blueprint (blue background, white lines)</SelectItem>
            <SelectItem value="modern">Modern (colorful, clean)</SelectItem>
            <SelectItem value="minimal">Minimal (simplified, monochrome)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Annotations Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="annotations"
          checked={annotations}
          onChange={(e) => onAnnotationsChange(e.target.checked)}
          className="w-4 h-4"
        />
        <Label htmlFor="annotations" className="cursor-pointer">
          Include labels, dimensions, and annotations
        </Label>
      </div>

      {/* Units (conditional) */}
      {showUnits && (
        <div>
          <Label>Measurement Units</Label>
          <RadioGroup value={units} onValueChange={onUnitsChange} className="mt-2">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="metric" id="metric" />
                <Label htmlFor="metric" className="cursor-pointer">
                  Metric (mm, cm, m)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="imperial" id="imperial" />
                <Label htmlFor="imperial" className="cursor-pointer">
                  Imperial (in, ft)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
```

### 3. useEngineeringDiagram Hook

**File:** `hooks/useEngineeringDiagram.ts`

```typescript
import { useState, useCallback } from "react";
import { DiagramConfig } from "@/components/Generator/types";
import to from "await-to-js";

interface UseEngineeringDiagramReturn {
  generating: boolean;
  diagramUrl: string | null;
  svgUrl: string | null;
  error: string | null;
  generateDiagram: (config: DiagramConfig) => Promise<void>;
  reset: () => void;
}

export function useEngineeringDiagram(): UseEngineeringDiagramReturn {
  const [generating, setGenerating] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDiagram = useCallback(async (config: DiagramConfig) => {
    setGenerating(true);
    setError(null);
    setDiagramUrl(null);
    setSvgUrl(null);

    const [err, response] = await to(
      fetch("/api/engineering/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
    );

    setGenerating(false);

    if (err || !response?.ok) {
      const errorData = await response?.json().catch(() => ({}));
      setError(errorData.error || "Diagram generation failed");
      return;
    }

    const data = await response.json();
    setDiagramUrl(data.imageUrl);
    setSvgUrl(data.svgUrl);
  }, []);

  const reset = useCallback(() => {
    setGenerating(false);
    setDiagramUrl(null);
    setSvgUrl(null);
    setError(null);
  }, []);

  return {
    generating,
    diagramUrl,
    svgUrl,
    error,
    generateDiagram,
    reset,
  };
}
```

## API Implementation

### Diagram Generation Endpoint

**File:** `app/api/engineering/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { DiagramConfig } from "@/components/Generator/types";
import { z } from "zod";

const DiagramConfigSchema = z.object({
  type: z.string(),
  category: z.string(),
  description: z.string().min(10),
  style: z.enum(["technical", "schematic", "blueprint", "modern", "minimal"]),
  annotations: z.boolean(),
  scale: z.string().optional(),
  units: z.enum(["metric", "imperial"]).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = DiagramConfigSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({ 
      error: "Invalid configuration", 
      details: validation.error 
    }, { status: 400 });
  }

  const config: DiagramConfig = validation.data;
  const creditsRequired = 3; // Technical diagrams cost 3 credits

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
    // Build specialized prompt for technical diagram
    const prompt = buildDiagramPrompt(config);
    
    // Generate diagram using Azure Flux
    const imageUrl = await generateDiagramImage(prompt, config);
    
    // Save to database
    const diagram = await prisma.engineeringDiagram.create({
      data: {
        userId: session.user.id,
        name: `${config.type} diagram`,
        type: config.type,
        category: config.category,
        description: config.description,
        config: config as any,
        imageUrl,
        tags: [config.category, config.type, config.style],
      }
    });

    return NextResponse.json({ 
      id: diagram.id,
      imageUrl: diagram.imageUrl,
      svgUrl: diagram.svgUrl 
    });

  } catch (error) {
    console.error("Diagram generation error:", error);
    
    // Refund credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: creditsRequired } }
    });

    return NextResponse.json({ error: "Diagram generation failed" }, { status: 500 });
  }
}

function buildDiagramPrompt(config: DiagramConfig): string {
  const parts = [];
  
  // Base description
  parts.push(config.description);
  
  // Style modifiers
  if (config.style === "technical") {
    parts.push("technical drawing style, black and white, precise lines, engineering standard");
  } else if (config.style === "schematic") {
    parts.push("schematic diagram with standard symbols, clean lines, professional");
  } else if (config.style === "blueprint") {
    parts.push("blueprint style, blue background, white lines, architectural drawing");
  } else if (config.style === "modern") {
    parts.push("modern clean design, minimal colors, clear hierarchy");
  } else if (config.style === "minimal") {
    parts.push("minimalist diagram, simple shapes, monochrome");
  }
  
  // Annotations
  if (config.annotations) {
    parts.push("with labels and annotations");
  }
  
  // Technical requirements
  parts.push("high precision, clear connections, professional quality");
  parts.push(`${config.type} diagram format`);
  
  return parts.join(", ");
}

async function generateDiagramImage(prompt: string, config: DiagramConfig): Promise<string> {
  // TODO: Integrate with Azure Flux generation
  // For technical diagrams, may want to use specific model fine-tuned for diagrams
  // Or combine AI generation with programmatic diagram generation libraries
  
  // Placeholder implementation
  return "https://placeholder.com/diagram.png";
}
```

## Diagram Prompt Conversion

**File:** `lib/diagramPrompts.ts`

```typescript
import { DiagramConfig, DiagramElement } from "@/components/Generator/types";

export function convertDescriptionToPrompt(config: DiagramConfig): string {
  const basePrompt = config.description;
  
  // Add type-specific prefixes
  const typePrefix = getTypePrefix(config.type);
  
  // Add style modifiers
  const styleModifiers = getStyleModifiers(config.style);
  
  // Add annotation requirements
  const annotationModifiers = config.annotations 
    ? "with clear labels, dimensions, and annotations" 
    : "without labels";
  
  return `${typePrefix} ${basePrompt}, ${styleModifiers}, ${annotationModifiers}, professional technical drawing, white background`;
}

function getTypePrefix(type: string): string {
  const prefixes: Record<string, string> = {
    "microservices": "System architecture diagram showing",
    "data-flow": "Data flow diagram (DFD) illustrating",
    "topology": "Network topology diagram depicting",
    "rack-diagram": "Server rack diagram showing",
    "schematic": "Electronic circuit schematic with",
    "pcb-layout": "PCB layout diagram showing",
    "process": "Process flowchart with",
    "uml": "UML diagram illustrating",
    "floorplan": "Architectural floor plan of",
    "isometric": "Isometric technical drawing of",
    "mechanical": "Mechanical engineering drawing of",
    "assembly": "Assembly diagram showing"
  };
  
  return prefixes[type] || "Technical diagram of";
}

function getStyleModifiers(style: string): string {
  const modifiers: Record<string, string> = {
    "technical": "black and white, precise technical lines, engineering standard symbols",
    "schematic": "standard schematic symbols, clean professional lines",
    "blueprint": "blueprint style with blue background and white lines",
    "modern": "modern clean design, minimal color palette, clear visual hierarchy",
    "minimal": "minimalist style, simple geometric shapes, monochrome"
  };
  
  return modifiers[style] || "professional technical style";
}

// For structured element input, convert to natural language
export function elementsToDescription(elements: DiagramElement[]): string {
  const descriptions: string[] = [];
  
  elements.forEach(element => {
    let desc = `${element.type} labeled "${element.label}"`;
    
    if (element.properties) {
      const props = Object.entries(element.properties)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      desc += ` (${props})`;
    }
    
    if (element.connections && element.connections.length > 0) {
      const connectedLabels = element.connections
        .map(id => elements.find(e => e.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      desc += ` connected to ${connectedLabels}`;
    }
    
    descriptions.push(desc);
  });
  
  return descriptions.join("; ");
}
```

## Integration with ImageGenerator

Update `components/Generator/ImageGenerator.tsx`:

```typescript
// Add imports
import { DiagramTypeSelector } from "@/components/Engineering/DiagramTypeSelector";
import { DiagramDescriptionInput } from "@/components/Engineering/DiagramDescriptionInput";
import { useEngineeringDiagram } from "@/hooks/useEngineeringDiagram";

// Inside component
const engineeringDiagram = useEngineeringDiagram();
const [diagramConfig, setDiagramConfig] = useState<DiagramConfig>({
  type: "microservices",
  category: "system",
  description: "",
  style: "technical",
  annotations: true,
  units: "metric",
});

const handleGenerateEngineering = () => {
  engineeringDiagram.generateDiagram(diagramConfig);
};

// In render
{generationMode === "engineering" && (
  <div className="space-y-6">
    <DiagramTypeSelector
      selectedType={diagramConfig.type}
      onSelectType={(type) => {
        const category = DIAGRAM_TYPES.find(d => d.subcategory === type)?.category || "system";
        setDiagramConfig(prev => ({ ...prev, type, category }));
      }}
    />
    
    <DiagramDescriptionInput
      diagramType={diagramConfig.type}
      description={diagramConfig.description}
      style={diagramConfig.style}
      annotations={diagramConfig.annotations}
      units={diagramConfig.units || "metric"}
      onDescriptionChange={(description) => 
        setDiagramConfig(prev => ({ ...prev, description }))
      }
      onStyleChange={(style: any) => 
        setDiagramConfig(prev => ({ ...prev, style }))
      }
      onAnnotationsChange={(annotations) => 
        setDiagramConfig(prev => ({ ...prev, annotations }))
      }
      onUnitsChange={(units: any) => 
        setDiagramConfig(prev => ({ ...prev, units }))
      }
      showUnits={diagramConfig.category === "cad" || diagramConfig.category === "architecture"}
    />
    
    <Button
      onClick={handleGenerateEngineering}
      disabled={engineeringDiagram.generating || !diagramConfig.description}
      className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
      size="lg"
    >
      {engineeringDiagram.generating 
        ? "Generating diagram..." 
        : "Generate Diagram (3 credits)"}
    </Button>
    
    {engineeringDiagram.diagramUrl && (
      <div className="mt-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <img 
          src={engineeringDiagram.diagramUrl} 
          alt="Generated diagram" 
          className="w-full rounded-lg bg-white p-4"
        />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">Download PNG</Button>
          <Button variant="outline" size="sm">Download SVG</Button>
          <Button variant="outline" size="sm">Download PDF</Button>
          <Button variant="outline" size="sm">Download DXF</Button>
        </div>
      </div>
    )}
    
    {engineeringDiagram.error && (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
        {engineeringDiagram.error}
      </div>
    )}
  </div>
)}
```

## Styling

Match existing dark theme:

```css
/* Add to globals.css */
.diagram-preview {
  @apply bg-white rounded-lg p-4 shadow-lg;
}

.diagram-card {
  @apply p-6 bg-zinc-900/50 rounded-lg border border-zinc-800;
}

.annotation-overlay {
  @apply absolute pointer-events-none;
}

.dimension-line {
  @apply border-t-2 border-dashed border-red-500;
}

.label-box {
  @apply bg-white/90 px-2 py-1 rounded shadow text-xs font-mono;
}

.blueprint-style {
  @apply bg-blue-900 text-white;
}
```

## Testing Checklist

- [ ] All 12 diagram types selectable
- [ ] Example prompts populate correctly
- [ ] Text description generates appropriate diagram
- [ ] Style options (technical, blueprint, etc.) work
- [ ] Annotations toggle works
- [ ] Units (metric/imperial) switch correctly
- [ ] Credits deducted properly
- [ ] Failed generations refund credits
- [ ] Export formats (SVG, PNG, PDF, DXF) work
- [ ] Diagram quality matches technical standards

## Success Criteria

1. ✅ Generate diagrams for 8+ types
2. ✅ Text-to-diagram works accurately
3. ✅ Export in 3+ formats (SVG, PNG, PDF)
4. ✅ Annotations render correctly
5. ✅ Professional technical quality
6. ✅ UI matches existing dark theme

## Timeline

- **Day 1:** Database schema + DiagramTypeSelector
- **Day 2:** DiagramDescriptionInput + example prompts
- **Day 3:** API endpoint + prompt conversion logic
- **Day 4:** Export functionality (multi-format)
- **Day 5:** Annotation system (optional)
- **Day 6:** Testing + refinement

## Deliverables

1. ✅ Working diagram generation (12+ types)
2. ✅ Text-to-diagram with examples
3. ✅ Multi-format export (SVG, PNG, PDF, DXF)
4. ✅ Style variations (technical, blueprint, modern)
5. ✅ Annotation system
6. ✅ Documentation updates

---

**Copy this entire prompt into a new chat window to implement Engineering Mode.**
