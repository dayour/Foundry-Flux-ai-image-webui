/**
 * Engineering Diagram Service
 * Handles diagram generation and format conversion
 */

import { DiagramConfig, ExportOptions } from "@/types/engineering";

export interface GenerateDiagramParams {
  config: DiagramConfig;
  userId: string;
  name?: string;
}

export interface GenerateDiagramResult {
  id: string;
  imageUrl: string;
  svgUrl?: string;
  success: boolean;
  error?: string;
}

/**
 * Generate an engineering diagram using Azure FLUX
 */
export async function generateEngineeringDiagram(
  params: GenerateDiagramParams
): Promise<GenerateDiagramResult> {
  const { config, userId, name } = params;

  try {
    // Construct the specialized prompt for engineering diagrams
    const prompt = buildEngineeringPrompt(config);

    // Call the generation API
    const response = await fetch("/api/engineering/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ensure cookies/session are sent so server can verify user and credits
      credentials: "include",
      body: JSON.stringify({
        prompt,
        config,
        userId,
        name: name || `${config.type}-${Date.now()}`,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = (result && (result.error || result.message)) || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return {
      id: result.id,
      imageUrl: result.imageUrl,
      svgUrl: result.svgUrl,
      success: true,
    };
  } catch (error) {
    console.error("Error generating engineering diagram:", error);
    return {
      id: "",
      imageUrl: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build a specialized prompt for engineering diagrams
 */
function buildEngineeringPrompt(config: DiagramConfig): string {
  const { type, category, description, style, annotations, units, elements } =
    config;

  let prompt = `Create a professional ${category} diagram: ${type}.\n\n`;

  // Add description
  prompt += `Description: ${description}\n\n`;

  // Add elements if provided
  if (elements && elements.length > 0) {
    prompt += "Elements:\n";
    elements.forEach((element) => {
      prompt += `- ${element.label} (${element.type})`;
      if (element.properties) {
        const props = Object.entries(element.properties)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        prompt += ` [${props}]`;
      }
      prompt += "\n";
    });
    prompt += "\n";

    // Add connections
    const connectionsMap = new Map<string, string[]>();
    elements.forEach((element) => {
      if (element.connections && element.connections.length > 0) {
        connectionsMap.set(element.id, element.connections);
      }
    });

    if (connectionsMap.size > 0) {
      prompt += "Connections:\n";
      connectionsMap.forEach((connections, elementId) => {
        const element = elements.find((e) => e.id === elementId);
        if (element) {
          connections.forEach((targetId) => {
            const target = elements.find((e) => e.id === targetId);
            if (target) {
              prompt += `- ${element.label} → ${target.label}\n`;
            }
          });
        }
      });
      prompt += "\n";
    }
  }

  // Add style instructions
  prompt += `Style: ${getStyleInstructions(style)}\n\n`;

  // Enforce viewpoint/representation rules per category/type so outputs match the selected diagram intent
  // Examples: floorplans must be top-down architectural plans; isometric should be 3D isometric view; schematics should be standard topological schematics.
  const viewpoint = getViewpointInstructions(config.category, config.type);
  if (viewpoint) {
    prompt += viewpoint + "\n\n";
  }

  // Add annotation requirements
  if (annotations) {
    prompt += "Include labels, measurements, and annotations.\n";
  }

  // Add unit system
  if (units) {
    prompt += `Use ${units} units (${units === "metric" ? "mm, cm, m" : "in, ft"}).\n`;
  }

  // Add technical requirements
  prompt += getTechnicalRequirements(category, type);

  // Ensure output contains metadata for automated exports: include SVG layer-friendly structure and explicit scale/units when requested
  if (config.units) {
    prompt += `\nInclude measurement annotations in ${config.units} units and provide a clear scale indicator (e.g. 1:100).`;
  }

  return prompt;
}

function getViewpointInstructions(category: string, type: string): string | null {
  // Map specific diagram types to viewpoint and representation constraints
  if (category === "architecture") {
    if (type === "floorplan") return "Render as a top-down architectural floor plan, with walls shown as thick lines, doors as arcs, windows indicated, room labels and dimensions; no perspective or isometric projection.";
    if (type === "isometric") return "Render as an isometric 3D technical drawing (axonometric), showing depth and height, not a top-down plan.";
  }
  if (category === "cad") {
    if (type === "mechanical") return "Render as orthographic views (top, front, side) with precise dimensioning and centerlines; provide scale and tolerances.";
  }
  if (category === "network") {
    return "Use standardized network symbols and a logical top-down layout showing devices, links and labels; avoid photorealism.";
  }
  if (category === "circuit") {
    return "Use standard electrical schematic symbols (ANSI/IEEE), consistent orientation, and clear nets; do not produce pictorial or PCB artwork unless 'pcb-layout' is requested.";
  }
  if (category === "flowchart") {
    return "Use standard flowchart shapes with clear flow direction (top-to-bottom or left-to-right), labeled decision boxes, and start/end markers.";
  }
  return null;
}

/**
 * Get style-specific instructions
 */
function getStyleInstructions(style: string): string {
  const styleMap: Record<string, string> = {
    technical:
      "Black and white, precise lines, technical drawing standards, clean and professional",
    schematic:
      "Standard symbols (ANSI/ISO), component labels, connection lines, professional schematic style",
    blueprint:
      "Blue background with white lines, architectural blueprint style, detailed annotations",
    modern:
      "Colorful, clean design, modern UI style, clear hierarchy, professional but approachable",
    minimal:
      "Simplified, minimal elements, focus on clarity, monochrome or limited color palette",
  };

  return styleMap[style] || "Professional technical style";
}

/**
 * Get category-specific technical requirements
 */
function getTechnicalRequirements(category: string, type: string): string {
  const requirements: Record<string, string> = {
    system: `
Technical requirements:
- Clear component boundaries
- Labeled connections and data flows
- Technology stack indicators
- Scalability indicators (replicas, instances)
`,
    network: `
Technical requirements:
- Standard network symbols
- IP addresses and subnets
- Connection types (fiber, ethernet)
- Port numbers and protocols
`,
    circuit: `
Technical requirements:
- Standard electronic symbols (ANSI/IEEE)
- Component values (resistors, capacitors)
- Connection nodes clearly marked
- Power and ground symbols
`,
    flowchart: `
Technical requirements:
- Standard flowchart shapes
- Clear decision points
- Flow direction indicators
- Start and end points
`,
    architecture: `
Technical requirements:
- Scale notation
- Dimension lines
- Room labels and sizes
- Door and window symbols
`,
    cad: `
Technical requirements:
- Precise dimensions
- Centerlines and construction lines
- Section views if needed
- Material callouts
`,
  };

  return requirements[category] || "";
}

/**
 * Export diagram to different formats
 */
export async function exportDiagram(
  diagramId: string,
  options: ExportOptions
): Promise<{ success: boolean; urls?: Record<string, string>; error?: string }> {
  try {
    const response = await fetch("/api/engineering/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        diagramId,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to export diagram");
    }

    const result = await response.json();
    return {
      success: true,
      urls: result.urls,
    };
  } catch (error) {
    console.error("Error exporting diagram:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user's engineering diagrams
 */
export async function getUserDiagrams(userId: string) {
  try {
    const response = await fetch(`/api/engineering/diagrams?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch diagrams");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return [];
  }
}

/**
 * Delete an engineering diagram
 */
export async function deleteDiagram(diagramId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/engineering/diagrams/${diagramId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting diagram:", error);
    return false;
  }
}
