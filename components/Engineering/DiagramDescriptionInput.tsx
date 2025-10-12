"use client";

import { ChangeEvent } from "react";
import { Lightbulb } from "lucide-react";

const EXAMPLE_PROMPTS: Record<string, string[]> = {
  microservices: [
    "API Gateway connecting to 3 microservices (Auth, Orders, Payments), each with its own PostgreSQL database",
    "Event-driven architecture with RabbitMQ message queue, 4 services, and Redis cache layer",
    "Kubernetes cluster with 2 namespaces (prod, staging), ingress controller, and 5 pods per namespace"
  ],
  topology: ["Corporate network: firewall, core switch, 3 access switches, 20 workstations"],
  schematic: ["555 timer circuit in astable mode with LED blinker output, 2 resistors and 2 capacitors"],
  floorplan: ["2-bedroom apartment: open living/kitchen area, 2 bedrooms, 1 bathroom, 900 sq ft total"],
  mechanical: ["L-bracket with 4 mounting holes (6mm diameter), overall dimensions 100mm x 50mm x 5mm thickness"],
  process: ["Customer order fulfillment: receive order → validate payment → check inventory → pack items → ship → confirm delivery"]
};

interface Props {
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

export function DiagramDescriptionInput({ diagramType, description, style, annotations, units, onDescriptionChange, onStyleChange, onAnnotationsChange, onUnitsChange, showUnits = false }: Props) {
  const examples = EXAMPLE_PROMPTS[diagramType] || [];

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(event.target.value);
  };

  const handleStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onStyleChange(event.target.value);
  };

  const handleAnnotationsChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAnnotationsChange(event.target.checked);
  };

  const handleUnitsChange = (event: ChangeEvent<HTMLInputElement>) => {
    onUnitsChange(event.target.value);
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <div>
        <label htmlFor="diagram-description" className="text-base font-semibold mb-2 block">Describe Your Diagram</label>
        <p className="text-sm text-zinc-400 mb-3">Provide a detailed description of what you want to create. Be specific about components, connections, and layout.</p>
        <textarea
          id="diagram-description"
          rows={6}
          value={description}
          onChange={handleDescriptionChange}
          placeholder={`Example: ${examples[0] || "Describe your diagram here..."}`}
          className="font-mono text-sm w-full rounded-md border border-zinc-700 bg-zinc-900/80 p-3 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      {examples.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Example Prompts</span>
          </div>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button key={index} onClick={() => onDescriptionChange(example)} className="w-full text-left p-3 text-sm bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 transition-all">{example}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="visual-style" className="block">Visual Style</label>
        <select
          id="visual-style"
          value={style}
          onChange={handleStyleChange}
          className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900/80 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="technical">Technical (black & white, precise)</option>
          <option value="schematic">Schematic (standard symbols)</option>
          <option value="blueprint">Blueprint (blue background, white lines)</option>
          <option value="modern">Modern (colorful, clean)</option>
          <option value="minimal">Minimal (simplified, monochrome)</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="annotations" checked={annotations} onChange={handleAnnotationsChange} className="w-4 h-4" />
        <label htmlFor="annotations" className="cursor-pointer">Include labels, dimensions, and annotations</label>
      </div>

      {showUnits && (
        <div>
          <label className="block">Measurement Units</label>
          <div className="mt-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer" htmlFor="metric">
              <input
                type="radio"
                id="metric"
                name="measurement-units"
                value="metric"
                checked={units === "metric"}
                onChange={handleUnitsChange}
                className="h-4 w-4"
              />
              <span>Metric (mm, cm, m)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" htmlFor="imperial">
              <input
                type="radio"
                id="imperial"
                name="measurement-units"
                value="imperial"
                checked={units === "imperial"}
                onChange={handleUnitsChange}
                className="h-4 w-4"
              />
              <span>Imperial (in, ft)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
