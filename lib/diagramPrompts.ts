import { DiagramConfig, DiagramElement } from "@/components/Generator/types";

export function convertDescriptionToPrompt(config: DiagramConfig): string {
  const basePrompt = config.description;
  const typePrefix = getTypePrefix(config.type);
  const styleModifiers = getStyleModifiers(config.style);
  const annotationModifiers = config.annotations ? "with clear labels, dimensions, and annotations" : "without labels";
  const elementsDesc = config.elements && config.elements.length ? elementsToDescription(config.elements) : "";
  return `${typePrefix} ${basePrompt}${elementsDesc?`, elements: ${elementsDesc}`:""}, ${styleModifiers}, ${annotationModifiers}, professional technical drawing, white background`;
}

function getTypePrefix(type: string): string {
  const prefixes: Record<string, string> = {
    microservices: "System architecture diagram showing",
    "data-flow": "Data flow diagram (DFD) illustrating",
    topology: "Network topology diagram depicting",
    "rack-diagram": "Server rack diagram showing",
    schematic: "Electronic circuit schematic with",
    "pcb-layout": "PCB layout diagram showing",
    process: "Process flowchart with",
    uml: "UML diagram illustrating",
    floorplan: "Architectural floor plan of",
    isometric: "Isometric technical drawing of",
    mechanical: "Mechanical engineering drawing of",
    assembly: "Assembly diagram showing"
  };
  return prefixes[type] || "Technical diagram of";
}

function getStyleModifiers(style: string): string {
  const modifiers: Record<string, string> = {
    technical: "black and white, precise technical lines, engineering standard symbols",
    schematic: "standard schematic symbols, clean professional lines",
    blueprint: "blueprint style with blue background and white lines",
    modern: "modern clean design, minimal color palette, clear visual hierarchy",
    minimal: "minimalist style, simple geometric shapes, monochrome"
  };
  return modifiers[style] || "professional technical style";
}

export function elementsToDescription(elements: DiagramElement[]): string {
  const descriptions: string[] = [];
  elements.forEach(element => {
    let desc = `${element.type} labeled \"${element.label}\"`;
    if (element.properties) {
      const props = Object.entries(element.properties).map(([k,v]) => `${k}: ${v}`).join(", ");
      desc += ` (${props})`;
    }
    if (element.connections && element.connections.length>0) {
      const connected = element.connections.map(id => elements.find(e=>e.id===id)?.label).filter(Boolean).join(", ");
      desc += ` connected to ${connected}`;
    }
    descriptions.push(desc);
  });
  return descriptions.join("; ");
}
