export interface GeneratorModelOption {
    id: string;
    label: string;
    description?: string;
    quality?: string;
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
    provider?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Generation mode types for different content categories
 */
export type GenerationMode = "images" | "video" | "synthetic" | "brand" | "engineering";

/**
 * Configuration for each generation mode tab
 */
export interface GenerationModeConfig {
  id: GenerationMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  /**
   * Which control sections to show for this mode
   */
  enabledControls: {
    aspectRatio?: boolean;
    model?: boolean;
    category?: boolean;
    industry?: boolean;
    audience?: boolean;
    useCase?: boolean;
    topic?: boolean;
    format?: boolean;
    lookAndFeel?: boolean;
    size?: boolean;
    quality?: boolean;
    colorSpace?: boolean;
    filter?: boolean;
    variations?: boolean;
    syntheticAsset?: boolean;
    // Engineering-specific
    diagramType?: boolean;
    engineeringFormat?: boolean;
    // Brand-specific
    brandElements?: boolean;
    // Video-specific
    duration?: boolean;
    frameRate?: boolean;
    animationStyle?: boolean;
  };
  /**
   * Default values for this mode
   */
  defaults?: {
    category?: string;
    useCase?: string;
    format?: string;
    aspectRatio?: string;
    lookAndFeel?: string;
  };
}

/**
 * Extended options specific to each generation mode
 */
export interface ModeSpecificOptions {
  // Engineering mode
  diagramType?: "dataflow" | "cad" | "floorplan" | "circuit" | "uml" | "network" | "other";
  engineeringFormat?: "technical" | "schematic" | "isometric" | "blueprint";
  
  // Brand mode
  brandElements?: string[]; // ["logo", "colorPalette", "typography", "patterns"]
  brandGuidelines?: string;
  
  // Video mode
  duration?: number; // seconds
  frameRate?: number; // fps
  animationStyle?: "realistic" | "cartoon" | "anime" | "motion-graphics" | "3d";
  
  // Synthetic/Eval mode
  datasetSize?: number;
  evaluationCriteria?: string[];
}

// Engineering-specific types
export interface DiagramElement {
  id: string;
  type: string;
  label: string;
  properties?: Record<string, any>;
  position?: { x: number; y: number };
  connections?: string[];
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

export interface DiagramConfig {
  type: string;
  category: string;
  description: string;
  elements?: DiagramElement[];
  style: "technical" | "schematic" | "blueprint" | "modern" | "minimal";
  annotations: boolean;
  scale?: string;
  units?: "metric" | "imperial";
}

export interface DiagramType {
  category: "system" | "network" | "circuit" | "flowchart" | "architecture" | "cad";
  subcategory: string;
  description: string;
  outputFormat: string[];
  icon?: React.ComponentType<any>;
}
