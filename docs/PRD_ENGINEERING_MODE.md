# PRD: Engineering & Technical Diagram Mode

## Product Overview

**Product Name:** Autogen Design - Engineering Mode  
**Version:** 1.0  
**Target Release:** Q1 2025  
**Owner:** Product Team  
**Status:** Planning

## Executive Summary

Engineering Mode transforms Autogen Design into a technical visualization powerhouse. Engineers, architects, and technical professionals can generate CAD drawings, system diagrams, network topologies, circuit schematics, UML diagrams, and architectural blueprints—all AI-generated with precision and professional formatting.

## Problem Statement

### Current Pain Points
1. **Tool complexity:** CAD software has steep learning curves (AutoCAD, Visio cost $1,000+/year)
2. **Time-consuming:** Manual diagram creation takes hours/days
3. **Limited templates:** Generic templates don't match specific needs
4. **Skill barrier:** Not everyone can draw technical diagrams
5. **Version control:** Difficult to iterate quickly on designs
6. **Export formats:** Need both editable (SVG) and print-ready (PDF) versions

### User Needs
- Generate system architecture diagrams quickly
- Create network topologies from text descriptions
- Produce CAD-style technical drawings
- Generate flowcharts and UML diagrams
- Export in editable formats (SVG, DXF)
- Maintain consistent technical styling
- Annotate with measurements and labels

## Target Users

### Primary Personas

**1. Software Architect (Sam, 36)**
- Designing microservices architecture
- Pain: Diagramming tools are tedious
- Goal: Visualize system design in 15 minutes
- Success: Clear architecture diagrams for team alignment

**2. Network Engineer (Patricia, 42)**
- Managing enterprise networks
- Pain: Visio is expensive and complex
- Goal: Generate network topology diagrams automatically
- Success: Documentation that matches actual infrastructure

**3. Electrical Engineer (Marcus, 29)**
- Designing circuit boards
- Pain: Schematic capture tools are overwhelming
- Goal: Quick concept schematics for proposals
- Success: Professional schematics without learning EDA tools

**4. Product Manager (Lily, 32)**
- Documenting product flows
- Tech comfort: Medium
- Pain: Can't create technical diagrams herself
- Goal: Flowcharts and user journey diagrams
- Success: Self-service technical documentation

## Goals & Success Metrics

### Primary Goals
1. **Adoption:** 25% of Pro users try Engineering mode in first month
2. **Complexity:** Generate diagrams with 10+ elements successfully
3. **Quality:** 4.2+ star rating on diagram accuracy
4. **Export:** 75%+ download SVG (editable) format
5. **Iteration:** Average 2.2 regenerations per diagram (refinement)

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Diagrams Created | 300/month | Analytics |
| Avg. Elements/Diagram | 12+ | Database query |
| SVG Export Rate | 75%+ | Funnel analysis |
| Enterprise Sign-ups | 20+ companies | Sales tracking |
| Support Tickets | <5% failure rate | Customer support |

## Technical Stack & Orchestration

Recommend GenAIScript for orchestrating long-running or multi-step diagram generations (e.g., large floorplans or PCB exports). Use GenAIScript to manage job splitting, provider fallback, polling, and webhook callbacks. Core stack: Next.js (TypeScript), Prisma, Konva.js/Fabric.js, makerjs (DXF), svg2pdf.

## Feature Requirements

### Must-Have (V1)

#### 1. Diagram Type Selection
**User Story:** As an engineer, I want to choose the right diagram type so that my visualization matches technical standards.

**Diagram Types:**
```typescript
interface DiagramType {
  category: "system" | "network" | "circuit" | "flowchart" | "architecture" | "cad";
  subcategory: string;
  description: string;
  outputFormat: string[];
}

const DIAGRAM_TYPES: DiagramType[] = [
  // System Architecture
  {
    category: "system",
    subcategory: "microservices",
    description: "Microservices architecture with services, APIs, databases",
    outputFormat: ["svg", "png", "pdf"]
  },
  {
    category: "system",
    subcategory: "data-flow",
    description: "Data flow diagram (DFD) showing information movement",
    outputFormat: ["svg", "png", "pdf"]
  },
  
  // Network
  {
    category: "network",
    subcategory: "topology",
    description: "Network topology (star, mesh, hybrid)",
    outputFormat: ["svg", "png", "pdf", "vsdx"]
  },
  {
    category: "network",
    subcategory: "rack-diagram",
    description: "Server rack layout and cable management",
    outputFormat: ["svg", "png", "pdf"]
  },
  
  // Circuit
  {
    category: "circuit",
    subcategory: "schematic",
    description: "Electronic circuit schematic with components",
    outputFormat: ["svg", "png", "pdf", "dxf"]
  },
  {
    category: "circuit",
    subcategory: "pcb-layout",
    description: "PCB layout (top view, component placement)",
    outputFormat: ["svg", "png", "pdf", "gerber"]
  },
  
  // Flowchart
  {
    category: "flowchart",
    subcategory: "process",
    description: "Business process flowchart",
    outputFormat: ["svg", "png", "pdf"]
  },
  {
    category: "flowchart",
    subcategory: "uml",
    description: "UML diagrams (class, sequence, activity)",
    outputFormat: ["svg", "png", "pdf", "plantuml"]
  },
  
  // Architecture
  {
    category: "architecture",
    subcategory: "floorplan",
    description: "Architectural floor plan",
    outputFormat: ["svg", "png", "pdf", "dxf"]
  },
  {
    category: "architecture",
    subcategory: "isometric",
    description: "Isometric technical drawing",
    outputFormat: ["svg", "png", "pdf"]
  },
  
  // CAD
  {
    category: "cad",
    subcategory: "mechanical",
    description: "Mechanical part drawing with dimensions",
    outputFormat: ["svg", "png", "pdf", "dxf", "step"]
  },
  {
    category: "cad",
    subcategory: "assembly",
    description: "Assembly drawing (exploded view)",
    outputFormat: ["svg", "png", "pdf", "dxf"]
  },
];
```

**Diagram Selection UI:**
```tsx
<div className="diagram-type-selector">
  <h3>Diagram Type</h3>
  
  {/* Category Tabs */}
  <div className="category-tabs flex gap-2 mb-6">
    {CATEGORIES.map(cat => (
      <button
        key={cat}
        className={cn(
          "px-4 py-2 rounded-lg",
          selectedCategory === cat && "bg-purple-500"
        )}
        onClick={() => setSelectedCategory(cat)}
      >
        {cat}
      </button>
    ))}
  </div>

  {/* Subcategory Grid */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {DIAGRAM_TYPES
      .filter(d => d.category === selectedCategory)
      .map(diagram => (
        <button
          key={diagram.subcategory}
          className={cn(
            "p-4 rounded-lg border-2 text-left",
            selectedDiagram === diagram.subcategory
              ? "border-purple-500 bg-purple-500/10"
              : "border-zinc-700 hover:border-zinc-600"
          )}
          onClick={() => setSelectedDiagram(diagram.subcategory)}
        >
          <div className="flex items-center gap-3 mb-2">
            <DiagramIcon type={diagram.subcategory} />
            <h4 className="font-semibold capitalize">
              {diagram.subcategory.replace("-", " ")}
            </h4>
          </div>
          <p className="text-xs text-zinc-400">{diagram.description}</p>
          <div className="flex gap-1 mt-2">
            {diagram.outputFormat.map(format => (
              <Badge key={format} variant="outline" className="text-xs">
                {format.toUpperCase()}
              </Badge>
            ))}
          </div>
        </button>
      ))}
  </div>
</div>
```

#### 2. Text-to-Diagram Generation
**User Story:** As a PM, I want to describe my diagram in plain English so that I don't need to learn complex tools.

**Input Interface:**
```typescript
interface DiagramConfig {
  type: string;
  description: string;           // Natural language description
  elements?: DiagramElement[];   // Optional structured input
  style: "technical" | "schematic" | "blueprint" | "modern" | "minimal";
  annotations: boolean;          // Include labels/measurements
  scale?: string;                // "1:100", "1:50", "actual size"
  units?: "metric" | "imperial"; // mm/cm vs inches/feet
}

interface DiagramElement {
  id: string;
  type: string;                  // "server", "router", "resistor", "room"
  label: string;
  properties?: Record<string, any>;
  connections?: string[];        // IDs of connected elements
}
```

**Text Input UI:**
```tsx
<div className="diagram-config p-6 bg-zinc-900/50 rounded-lg">
  <h3>Describe Your Diagram</h3>
  
  <Textarea
    rows={6}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder={getPlaceholder(selectedDiagram)}
    className="mb-4"
  />
  
  <div className="example-prompts">
    <p className="text-sm text-zinc-400 mb-2">Example prompts:</p>
    <div className="flex flex-wrap gap-2">
      {EXAMPLE_PROMPTS[selectedDiagram]?.map(example => (
        <Button
          key={example}
          variant="outline"
          size="sm"
          onClick={() => setDescription(example)}
        >
          {example}
        </Button>
      ))}
    </div>
  </div>

  {/* Style Options */}
  <div className="mt-6">
    <Label>Visual Style</Label>
    <Select value={style} onValueChange={setStyle}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="technical">Technical (black & white, precise)</SelectItem>
        <SelectItem value="schematic">Schematic (standard symbols)</SelectItem>
        <SelectItem value="blueprint">Blueprint (blue background)</SelectItem>
        <SelectItem value="modern">Modern (colorful, clean)</SelectItem>
        <SelectItem value="minimal">Minimal (simplified)</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Annotations Toggle */}
  <div className="flex items-center gap-2 mt-4">
    <input
      type="checkbox"
      id="annotations"
      checked={annotations}
      onChange={(e) => setAnnotations(e.target.checked)}
    />
    <Label htmlFor="annotations">Include labels and measurements</Label>
  </div>

  {/* Units (for CAD/Architecture) */}
  {(selectedCategory === "cad" || selectedCategory === "architecture") && (
    <div className="mt-4">
      <Label>Units</Label>
      <RadioGroup value={units} onValueChange={setUnits}>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="metric" id="metric" />
            <Label htmlFor="metric">Metric (mm, cm, m)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="imperial" id="imperial" />
            <Label htmlFor="imperial">Imperial (in, ft)</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  )}
</div>
```

**Example Prompts by Type:**
```typescript
const EXAMPLE_PROMPTS = {
  "microservices": [
    "API Gateway connecting to 3 microservices (Auth, Orders, Payments), each with its own database",
    "Event-driven architecture with message queue, 4 services, and Redis cache",
    "Kubernetes cluster with 2 namespaces, ingress controller, and 5 pods"
  ],
  "topology": [
    "Corporate network with firewall, core switch, 3 access switches, and 20 workstations",
    "Home network with modem, router, WiFi access point, and 5 devices",
    "Data center network with redundant routers, multiple VLANs, and load balancer"
  ],
  "schematic": [
    "555 timer circuit in astable mode with LED output",
    "Arduino-based temperature sensor circuit with LCD display",
    "Power supply circuit: AC input, bridge rectifier, voltage regulator, output capacitor"
  ],
  "floorplan": [
    "2-bedroom apartment: living room, kitchen, 2 bedrooms, 1 bathroom, 900 sq ft",
    "Small office: reception, 3 private offices, conference room, kitchenette",
    "Retail store: entrance, checkout counter, 4 display areas, stockroom"
  ],
  "mechanical": [
    "Bracket with 4 mounting holes, 100mm x 50mm x 5mm",
    "Shaft with keyway, 20mm diameter, 150mm length",
    "Housing with threaded bore and mounting flange"
  ]
};
```

#### 3. Structured Element Editor (Advanced)
**User Story:** As a technical user, I want fine-grained control so that I can specify exact components and connections.

**Structured Editor UI:**
```tsx
<div className="structured-editor">
  <div className="flex justify-between items-center mb-4">
    <h4>Elements ({elements.length})</h4>
    <Button onClick={addElement} size="sm">+ Add Element</Button>
  </div>

  {elements.map((element, index) => (
    <div key={element.id} className="element-card mb-3 p-4 border border-zinc-700 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        {/* Element Type */}
        <div>
          <Label>Type</Label>
          <Select
            value={element.type}
            onValueChange={(value) => updateElement(index, "type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getElementTypes(selectedDiagram).map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Label */}
        <div>
          <Label>Label</Label>
          <Input
            value={element.label}
            onChange={(e) => updateElement(index, "label", e.target.value)}
            placeholder="e.g., API Gateway, Router 1"
          />
        </div>
      </div>

      {/* Properties (dynamic based on type) */}
      {element.type && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {getPropertiesForType(element.type).map(prop => (
            <div key={prop.key}>
              <Label>{prop.label}</Label>
              <Input
                type={prop.type}
                value={element.properties?.[prop.key] || ""}
                onChange={(e) => updateElementProperty(index, prop.key, e.target.value)}
                placeholder={prop.placeholder}
              />
            </div>
          ))}
        </div>
      )}

      {/* Connections */}
      <div className="mt-3">
        <Label>Connects To</Label>
        <MultiSelect
          options={elements
            .filter(e => e.id !== element.id)
            .map(e => ({ value: e.id, label: e.label }))}
          value={element.connections || []}
          onChange={(connections) => updateElement(index, "connections", connections)}
        />
      </div>

      {/* Remove Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => removeElement(index)}
        className="mt-3"
      >
        Remove
      </Button>
    </div>
  ))}
</div>
```

#### 4. Measurement & Annotation System
**User Story:** As an engineer, I want dimensions and labels so that my diagram can be used for implementation.

**Annotation Types:**
```typescript
interface Annotation {
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
```

**Annotation UI (overlaid on diagram):**
```tsx
<div className="diagram-preview relative">
  {/* Generated Diagram */}
  <img src={diagramUrl} alt="Generated diagram" className="w-full" />

  {/* Annotation Overlays */}
  {annotations.map(annotation => (
    <div
      key={annotation.id}
      className="annotation absolute"
      style={{
        left: `${annotation.position.x}%`,
        top: `${annotation.position.y}%`
      }}
    >
      {annotation.type === "dimension" && (
        <div className="dimension-line">
          <div className="arrow-start" />
          <div className="dimension-text">
            {annotation.value} {annotation.unit}
          </div>
          <div className="arrow-end" />
        </div>
      )}
      
      {annotation.type === "label" && (
        <div className="label-box bg-white/90 px-2 py-1 rounded shadow">
          {annotation.text}
        </div>
      )}
      
      {annotation.type === "callout" && (
        <div className="callout">
          <div className="callout-line" />
          <div className="callout-text bg-yellow-100 p-2 rounded">
            {annotation.text}
          </div>
        </div>
      )}
    </div>
  ))}

  {/* Annotation Controls */}
  <div className="annotation-toolbar absolute top-4 right-4 flex gap-2">
    <Button size="sm" onClick={() => addAnnotation("dimension")}>
      + Dimension
    </Button>
    <Button size="sm" onClick={() => addAnnotation("label")}>
      + Label
    </Button>
    <Button size="sm" onClick={() => addAnnotation("note")}>
      + Note
    </Button>
  </div>
</div>
```

#### 5. Multi-Format Export
**User Story:** As a technical professional, I need editable formats so that I can refine diagrams in specialized tools.

**Export Formats:**
- **SVG:** Editable vector (Inkscape, Illustrator)
- **PNG:** High-res raster (presentations, documentation)
- **PDF:** Print-ready (reports, proposals)
- **DXF:** CAD interchange (AutoCAD, Fusion 360)
- **VSDX:** Visio format (network diagrams)
- **PlantUML:** Code-based UML (version control)
- **Gerber:** PCB manufacturing (circuit boards)

**Export Dialog:**
```tsx
<Dialog open={exportOpen} onOpenChange={setExportOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Export Diagram</DialogTitle>
    </DialogHeader>

    <div className="export-options space-y-4">
      {/* Primary Format */}
      <div>
        <Label>Primary Format</Label>
        <Select value={primaryFormat} onValueChange={setPrimaryFormat}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="svg">SVG (Editable Vector)</SelectItem>
            <SelectItem value="png">PNG (High Resolution)</SelectItem>
            <SelectItem value="pdf">PDF (Print Ready)</SelectItem>
            <SelectItem value="dxf">DXF (CAD Format)</SelectItem>
            <SelectItem value="vsdx">VSDX (Visio)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resolution (for PNG) */}
      {primaryFormat === "png" && (
        <div>
          <Label>Resolution</Label>
          <Select value={resolution} onValueChange={setResolution}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1x">Standard (1920px)</SelectItem>
              <SelectItem value="2x">High (3840px)</SelectItem>
              <SelectItem value="4x">Ultra (7680px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Additional Formats */}
      <div>
        <Label>Also Export As (optional)</Label>
        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={exportSVG} onChange={e => setExportSVG(e.target.checked)} />
            <span>SVG</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={exportPDF} onChange={e => setExportPDF(e.target.checked)} />
            <span>PDF</span>
          </label>
          {selectedDiagram === "schematic" && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={exportGerber} onChange={e => setExportGerber(e.target.checked)} />
              <span>Gerber (PCB Manufacturing)</span>
            </label>
          )}
        </div>
      </div>

      {/* Layers (for CAD formats) */}
      {(primaryFormat === "dxf" || primaryFormat === "svg") && (
        <div>
          <Label>Layers to Include</Label>
          <div className="flex flex-col gap-2 mt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={layers.dimensions} onChange={() => toggleLayer("dimensions")} />
              <span>Dimensions</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={layers.annotations} onChange={() => toggleLayer("annotations")} />
              <span>Annotations</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={layers.grid} onChange={() => toggleLayer("grid")} />
              <span>Grid</span>
            </label>
          </div>
        </div>
      )}

      {/* File Name */}
      <div>
        <Label>File Name</Label>
        <Input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="my-diagram"
        />
        <p className="text-xs text-zinc-400 mt-1">
          Extension will be added automatically
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setExportOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleExport} disabled={exporting}>
        {exporting ? "Exporting..." : "Export"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Should-Have (V2)

#### 6. Template Library
- Pre-built diagram templates
- Industry-standard symbols (ANSI, ISO, IEEE)
- Customizable component libraries
- Save custom templates

#### 7. Collaboration Features
- Real-time diagram sharing
- Comment and annotation system
- Version history
- Team libraries

#### 8. Smart Validation
- Check for diagram errors (disconnected nodes, missing labels)
- Suggest improvements
- Compliance checking (building codes, electrical standards)
- Auto-routing for connections

### Nice-to-Have (V3)

#### 9. CAD Integration
- Import/export to AutoCAD, Fusion 360
- Parametric design support
- 3D visualization preview
- BOM (Bill of Materials) generation

#### 10. Simulation
- Network traffic simulation
- Circuit simulation (SPICE)
- Structural analysis preview
- Cost estimation

## Database Schema

```prisma
model EngineeringDiagram {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  type          String   // "microservices", "topology", "schematic", etc.
  category      String   // "system", "network", "circuit", etc.
  
  description   String   @db.Text
  
  // Structure
  elements      Json     // DiagramElement[]
  annotations   Json?    // Annotation[]
  
  // Configuration
  config        Json     // DiagramConfig
  
  // Output
  imageUrl      String
  svgUrl        String?
  dxfUrl        String?
  
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

## Success Criteria

**Launch is successful if:**
1. ✅ 100+ engineering diagrams created in first month
2. ✅ Support 8+ diagram types
3. ✅ 75%+ SVG export rate
4. ✅ 4.2+ star quality rating
5. ✅ <5% error/complaint rate

**Post-launch (3 months):**
1. ✅ Enterprise customers (engineering firms)
2. ✅ Featured in engineering communities
3. ✅ Integration with CAD tools
4. ✅ Published case studies (network design, circuit design)

---

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Next Review:** Weekly during development
