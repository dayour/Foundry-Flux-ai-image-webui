/**
 * Engineering Diagram Type Definitions
 * Comprehensive catalog of supported technical diagrams
 */

import { DiagramType } from "@/types/engineering";

export const DIAGRAM_TYPES: DiagramType[] = [
  // System Architecture
  {
    category: "system",
    subcategory: "microservices",
    description: "Microservices architecture with services, APIs, databases",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "system",
    subcategory: "data-flow",
    description: "Data flow diagram (DFD) showing information movement",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "system",
    subcategory: "cloud-architecture",
    description: "Cloud infrastructure with compute, storage, networking",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "system",
    subcategory: "deployment",
    description: "Application deployment diagram with infrastructure",
    outputFormat: ["svg", "png", "pdf"],
  },

  // Network
  {
    category: "network",
    subcategory: "topology",
    description: "Network topology (star, mesh, hybrid)",
    outputFormat: ["svg", "png", "pdf", "vsdx"],
  },
  {
    category: "network",
    subcategory: "rack-diagram",
    description: "Server rack layout and cable management",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "network",
    subcategory: "vlan",
    description: "VLAN configuration and segmentation",
    outputFormat: ["svg", "png", "pdf", "vsdx"],
  },
  {
    category: "network",
    subcategory: "wan",
    description: "Wide area network with multiple sites",
    outputFormat: ["svg", "png", "pdf", "vsdx"],
  },

  // Circuit
  {
    category: "circuit",
    subcategory: "schematic",
    description: "Electronic circuit schematic with components",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
  {
    category: "circuit",
    subcategory: "pcb-layout",
    description: "PCB layout (top view, component placement)",
    outputFormat: ["svg", "png", "pdf", "gerber"],
  },
  {
    category: "circuit",
    subcategory: "wiring-diagram",
    description: "Electrical wiring and connection diagram",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "circuit",
    subcategory: "power-distribution",
    description: "Power distribution and electrical panel layout",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },

  // Flowchart
  {
    category: "flowchart",
    subcategory: "process",
    description: "Business process flowchart",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "flowchart",
    subcategory: "uml-class",
    description: "UML class diagram with relationships",
    outputFormat: ["svg", "png", "pdf", "plantuml"],
  },
  {
    category: "flowchart",
    subcategory: "uml-sequence",
    description: "UML sequence diagram showing interactions",
    outputFormat: ["svg", "png", "pdf", "plantuml"],
  },
  {
    category: "flowchart",
    subcategory: "uml-activity",
    description: "UML activity diagram for workflows",
    outputFormat: ["svg", "png", "pdf", "plantuml"],
  },
  {
    category: "flowchart",
    subcategory: "state-machine",
    description: "State machine diagram with transitions",
    outputFormat: ["svg", "png", "pdf", "plantuml"],
  },

  // Architecture
  {
    category: "architecture",
    subcategory: "floorplan",
    description: "Architectural floor plan",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
  {
    category: "architecture",
    subcategory: "isometric",
    description: "Isometric technical drawing",
    outputFormat: ["svg", "png", "pdf"],
  },
  {
    category: "architecture",
    subcategory: "elevation",
    description: "Building elevation view",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
  {
    category: "architecture",
    subcategory: "site-plan",
    description: "Site plan with landscaping and utilities",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },

  // CAD
  {
    category: "cad",
    subcategory: "mechanical",
    description: "Mechanical part drawing with dimensions",
    outputFormat: ["svg", "png", "pdf", "dxf", "step"],
  },
  {
    category: "cad",
    subcategory: "assembly",
    description: "Assembly drawing (exploded view)",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
  {
    category: "cad",
    subcategory: "section",
    description: "Cross-section view of parts",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
  {
    category: "cad",
    subcategory: "detail",
    description: "Detailed view with close-up annotations",
    outputFormat: ["svg", "png", "pdf", "dxf"],
  },
];

export const DIAGRAM_CATEGORIES = [
  { id: "system", label: "System Architecture" },
  { id: "network", label: "Network" },
  { id: "circuit", label: "Circuit & PCB" },
  { id: "flowchart", label: "Flowchart & UML" },
  { id: "architecture", label: "Architecture" },
  { id: "cad", label: "CAD & Mechanical" },
] as const;

export const EXAMPLE_PROMPTS: Record<string, string[]> = {
  microservices: [
    "API Gateway connecting to 3 microservices (Auth, Orders, Payments), each with its own database",
    "Event-driven architecture with message queue, 4 services, and Redis cache",
    "Kubernetes cluster with 2 namespaces, ingress controller, and 5 pods",
  ],
  "data-flow": [
    "User input → Validation → Processing → Database → Response flow",
    "E-commerce checkout: Cart → Payment Gateway → Order Processing → Fulfillment",
    "ETL pipeline: Extract from API → Transform data → Load to warehouse",
  ],
  topology: [
    "Corporate network with firewall, core switch, 3 access switches, and 20 workstations",
    "Home network with modem, router, WiFi access point, and 5 devices",
    "Data center network with redundant routers, multiple VLANs, and load balancer",
  ],
  "rack-diagram": [
    "42U server rack with 4 servers, network switch, PDU, and cable management",
    "Network equipment rack: router, firewall, 3 switches, patch panel",
  ],
  schematic: [
    "555 timer circuit in astable mode with LED output",
    "Arduino-based temperature sensor circuit with LCD display",
    "Power supply circuit: AC input, bridge rectifier, voltage regulator, output capacitor",
  ],
  "pcb-layout": [
    "Arduino shield PCB with 8 GPIO pins, power regulation, and mounting holes",
    "Two-layer PCB with microcontroller, sensors, and communication module",
  ],
  process: [
    "Customer onboarding workflow with approval gates",
    "Bug triage process from report to resolution",
    "Content approval workflow with review stages",
  ],
  "uml-class": [
    "E-commerce system: User, Product, Order, Payment classes with relationships",
    "Library management: Book, Member, Loan, Fine classes",
  ],
  "uml-sequence": [
    "User login sequence: UI → Controller → AuthService → Database",
    "Payment processing: Client → API → Payment Gateway → Bank → Response",
  ],
  floorplan: [
    "2-bedroom apartment: living room, kitchen, 2 bedrooms, 1 bathroom, 900 sq ft",
    "Small office: reception, 3 private offices, conference room, kitchenette",
    "Retail store: entrance, checkout counter, 4 display areas, stockroom",
  ],
  isometric: [
    "Plumbing system isometric with pipes, valves, and fixtures",
    "HVAC ductwork in isometric view",
  ],
  mechanical: [
    "Bracket with 4 mounting holes, 100mm x 50mm x 5mm",
    "Shaft with keyway, 20mm diameter, 150mm length",
    "Housing with threaded bore and mounting flange",
  ],
  assembly: [
    "Simple gear assembly with 3 gears, shaft, and housing",
    "Bearing mount assembly with exploded view",
  ],
};
