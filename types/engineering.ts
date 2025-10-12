/**
 * Engineering Mode Type Definitions
 * Defines all types for technical diagram generation
 */

export type DiagramCategory =
  | "system"
  | "network"
  | "circuit"
  | "flowchart"
  | "architecture"
  | "cad";

export type DiagramStyle =
  | "technical"
  | "schematic"
  | "blueprint"
  | "modern"
  | "minimal";

export type UnitSystem = "metric" | "imperial";

export type ExportFormat =
  | "svg"
  | "png"
  | "pdf"
  | "dxf"
  | "vsdx"
  | "plantuml"
  | "gerber"
  | "step";

export interface DiagramType {
  category: DiagramCategory;
  subcategory: string;
  description: string;
  outputFormat: ExportFormat[];
  icon?: string;
}

export interface DiagramElement {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, any>;
  connections?: string[];
  position?: {
    x: number;
    y: number;
  };
}

export interface DiagramConfig {
  type: string;
  category: DiagramCategory;
  description: string;
  elements?: DiagramElement[];
  style: DiagramStyle;
  annotations: boolean;
  scale?: string;
  units?: UnitSystem;
  grid?: boolean;
  layers?: {
    dimensions: boolean;
    annotations: boolean;
    grid: boolean;
  };
}

export type AnnotationType =
  | "dimension"
  | "label"
  | "note"
  | "callout"
  | "symbol";

export interface Annotation {
  id: string;
  type: AnnotationType;
  position: {
    x: number;
    y: number;
  };
  text: string;
  value?: number;
  unit?: string;
  style?: {
    fontSize: number;
    color: string;
    arrowStyle?: "single" | "double" | "none";
  };
}

export interface EngineeringDiagram {
  id: string;
  userId: string;
  name: string;
  type: string;
  category: DiagramCategory;
  description: string;
  elements?: DiagramElement[];
  annotations?: Annotation[];
  config: DiagramConfig;
  imageUrl: string;
  svgUrl?: string;
  dxfUrl?: string;
  pdfUrl?: string;
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportOptions {
  primaryFormat: ExportFormat;
  resolution?: "1x" | "2x" | "4x";
  additionalFormats?: ExportFormat[];
  layers?: {
    dimensions: boolean;
    annotations: boolean;
    grid: boolean;
  };
  fileName: string;
}

export interface ElementProperty {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "color";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}
