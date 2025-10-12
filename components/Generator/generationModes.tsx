/**
 * Configuration for different generation modes
 */

import { ImageIcon, Video, FlaskConical, Palette, Network } from "lucide-react";
import type { GenerationModeConfig } from "./types";

export const GENERATION_MODES: GenerationModeConfig[] = [
  {
    id: "images",
    label: "Images",
    icon: ImageIcon,
    description: "Generate high-quality images from text prompts",
    enabledControls: {
      aspectRatio: true,
      model: true,
      category: true,
      industry: true,
      audience: true,
      useCase: true,
      topic: true,
      format: true,
      lookAndFeel: true,
      size: true,
      quality: true,
      colorSpace: true,
      filter: true,
      variations: true,
      syntheticAsset: true,
    },
    defaults: {
      category: "Any",
      useCase: "Any",
      format: "PNG",
      aspectRatio: "1:1",
    },
  },
  {
    id: "video",
    label: "Video",
    icon: Video,
    description: "Create animated videos and motion graphics",
    enabledControls: {
      aspectRatio: true,
      model: true,
      category: true,
      useCase: true,
      topic: true,
      lookAndFeel: true,
      duration: true,
      frameRate: true,
      animationStyle: true,
      variations: true,
    },
    defaults: {
      category: "Motion Graphics",
      useCase: "Social Post",
      aspectRatio: "16:9",
    },
  },
  {
    id: "synthetic",
    label: "Synthetic/Eval",
    icon: FlaskConical,
    description: "Generate synthetic datasets for testing and evaluation",
    enabledControls: {
      aspectRatio: true,
      model: true,
      category: true,
      industry: true,
      audience: true,
      topic: true,
      format: true,
      size: true,
      quality: true,
      variations: true,
      syntheticAsset: true,
    },
    defaults: {
      category: "Any",
      format: "PNG",
      aspectRatio: "1:1",
    },
  },
  {
    id: "brand",
    label: "Brand Kit",
    icon: Palette,
    description: "Create cohesive brand assets and style guides",
    enabledControls: {
      aspectRatio: true,
      model: true,
      industry: true,
      audience: true,
      useCase: true,
      topic: true,
      format: true,
      lookAndFeel: true,
      size: true,
      quality: true,
      colorSpace: true,
      brandElements: true,
      variations: true,
    },
    defaults: {
      category: "Branding",
      useCase: "Hero Image",
      format: "PNG",
      aspectRatio: "16:9",
      lookAndFeel: "Minimal",
    },
  },
  {
    id: "engineering",
    label: "Engineering",
    icon: Network,
    description: "Generate technical diagrams, CAD, and 3D renderings",
    enabledControls: {
      aspectRatio: true,
      model: true,
      useCase: true,
      topic: true,
      format: true,
      size: true,
      quality: true,
      diagramType: true,
      engineeringFormat: true,
      variations: true,
    },
    defaults: {
      category: "Concept Art",
      useCase: "Storyboard Frame",
      format: "PNG",
      aspectRatio: "16:9",
      lookAndFeel: "Minimal",
    },
  },
];

/**
 * Get configuration for a specific generation mode
 */
export function getModeConfig(mode: string): GenerationModeConfig | undefined {
  return GENERATION_MODES.find((m) => m.id === mode);
}

/**
 * Check if a control should be visible for the current mode
 */
export function isControlEnabled(
  mode: string,
  controlName: keyof GenerationModeConfig["enabledControls"]
): boolean {
  const config = getModeConfig(mode);
  return config?.enabledControls[controlName] ?? false;
}
