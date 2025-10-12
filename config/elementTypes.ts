/**
 * Element Type Definitions
 * Defines available elements for each diagram type
 */

import { ElementProperty } from "@/types/engineering";

export const ELEMENT_TYPES: Record<string, string[]> = {
  // System Architecture
  microservices: [
    "API Gateway",
    "Microservice",
    "Database",
    "Cache",
    "Message Queue",
    "Load Balancer",
    "CDN",
  ],
  "data-flow": [
    "Process",
    "Data Store",
    "External Entity",
    "Data Flow",
  ],
  "cloud-architecture": [
    "Virtual Machine",
    "Container",
    "Storage",
    "Database",
    "Load Balancer",
    "VPN Gateway",
    "Function",
  ],

  // Network
  topology: [
    "Router",
    "Switch",
    "Firewall",
    "Server",
    "Workstation",
    "Access Point",
    "Modem",
    "Printer",
  ],
  "rack-diagram": [
    "Server",
    "Switch",
    "Router",
    "PDU",
    "Patch Panel",
    "UPS",
    "Blank Panel",
  ],

  // Circuit
  schematic: [
    "Resistor",
    "Capacitor",
    "Inductor",
    "Diode",
    "LED",
    "Transistor",
    "IC",
    "Battery",
    "Ground",
  ],
  "pcb-layout": [
    "IC",
    "Connector",
    "Resistor",
    "Capacitor",
    "LED",
    "Switch",
    "Via",
    "Mounting Hole",
  ],

  // Flowchart
  process: [
    "Process",
    "Decision",
    "Start/End",
    "Document",
    "Database",
    "Connector",
  ],
  "uml-class": [
    "Class",
    "Interface",
    "Abstract Class",
    "Enum",
  ],
  "uml-sequence": [
    "Actor",
    "Object",
    "Lifeline",
    "Activation",
    "Message",
  ],

  // Architecture
  floorplan: [
    "Room",
    "Door",
    "Window",
    "Wall",
    "Stairs",
    "Furniture",
  ],

  // CAD
  mechanical: [
    "Part",
    "Dimension",
    "Centerline",
    "Section Line",
  ],
};

export const ELEMENT_PROPERTIES: Record<string, ElementProperty[]> = {
  // System
  "API Gateway": [
    { key: "port", label: "Port", type: "text", placeholder: "8080" },
    { key: "protocol", label: "Protocol", type: "select", options: ["HTTP", "HTTPS", "WebSocket"] },
  ],
  Microservice: [
    { key: "language", label: "Language", type: "text", placeholder: "Node.js" },
    { key: "port", label: "Port", type: "text", placeholder: "3000" },
    { key: "replicas", label: "Replicas", type: "number", placeholder: "3" },
  ],
  Database: [
    { key: "type", label: "Type", type: "select", options: ["PostgreSQL", "MySQL", "MongoDB", "Redis"] },
    { key: "size", label: "Size", type: "text", placeholder: "100GB" },
  ],

  // Network
  Router: [
    { key: "model", label: "Model", type: "text", placeholder: "Cisco 2900" },
    { key: "ports", label: "Ports", type: "number", placeholder: "24" },
    { key: "ip", label: "IP Address", type: "text", placeholder: "192.168.1.1" },
  ],
  Switch: [
    { key: "ports", label: "Ports", type: "number", placeholder: "48" },
    { key: "speed", label: "Speed", type: "select", options: ["1Gbps", "10Gbps", "100Gbps"] },
  ],

  // Circuit
  Resistor: [
    { key: "value", label: "Value", type: "text", placeholder: "10kΩ" },
    { key: "power", label: "Power", type: "text", placeholder: "0.25W" },
  ],
  Capacitor: [
    { key: "value", label: "Value", type: "text", placeholder: "100µF" },
    { key: "voltage", label: "Voltage", type: "text", placeholder: "16V" },
  ],

  // Architecture
  Room: [
    { key: "width", label: "Width", type: "number", placeholder: "12" },
    { key: "length", label: "Length", type: "number", placeholder: "15" },
    { key: "purpose", label: "Purpose", type: "text", placeholder: "Living Room" },
  ],
  Door: [
    { key: "width", label: "Width", type: "number", placeholder: "36" },
    { key: "type", label: "Type", type: "select", options: ["Single", "Double", "Sliding"] },
  ],

  // CAD
  Part: [
    { key: "material", label: "Material", type: "text", placeholder: "Steel" },
    { key: "thickness", label: "Thickness", type: "number", placeholder: "5" },
  ],
};

export function getElementTypes(diagramType: string): string[] {
  return ELEMENT_TYPES[diagramType] || [];
}

export function getPropertiesForType(elementType: string): ElementProperty[] {
  return ELEMENT_PROPERTIES[elementType] || [];
}
