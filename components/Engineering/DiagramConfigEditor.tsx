/**
 * Diagram Configuration Component
 * Text input and settings for diagram generation
 */

"use client";

import { useState } from "react";
import { DiagramConfig, DiagramStyle, UnitSystem } from "@/types/engineering";
import { EXAMPLE_PROMPTS } from "@/config/diagramTypes";

interface DiagramConfigEditorProps {
  diagramType: string;
  config: Partial<DiagramConfig>;
  onChange: (config: Partial<DiagramConfig>) => void;
}

export function DiagramConfigEditor({
  diagramType,
  config,
  onChange,
}: DiagramConfigEditorProps) {
  const examples = EXAMPLE_PROMPTS[diagramType] || [];

  const handleDescriptionChange = (description: string) => {
    onChange({ ...config, description });
  };

  const handleStyleChange = (style: DiagramStyle) => {
    onChange({ ...config, style });
  };

  const handleAnnotationsChange = (annotations: boolean) => {
    onChange({ ...config, annotations });
  };

  const handleUnitsChange = (units: UnitSystem) => {
    onChange({ ...config, units });
  };

  const needsUnits =
    config.category === "cad" || config.category === "architecture";

  return (
    <div className="diagram-config-editor p-6 bg-zinc-900/50 rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Describe Your Diagram</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Provide a detailed description of what you want to generate
        </p>

        <textarea
          rows={6}
          value={config.description || ""}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleDescriptionChange(e.target.value)}
          placeholder={getPlaceholder(diagramType)}
          className="mb-4 bg-zinc-950 border-zinc-700 focus:border-purple-500 w-full p-3 rounded-lg text-white"
        />

        {/* Example Prompts */}
        {examples.length > 0 && (
          <div className="example-prompts">
            <p className="text-sm text-zinc-400 mb-2">Example prompts:</p>
            <div className="flex flex-col gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="text-left justify-start h-auto py-2 px-3 text-xs border border-zinc-700 hover:border-zinc-600 rounded transition-colors"
                  onClick={() => handleDescriptionChange(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Style Options */}
      <div>
        <label htmlFor="visual-style" className="text-base block mb-2">Visual Style</label>
        <select
          id="visual-style"
          value={config.style || "technical"}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStyleChange(e.target.value as DiagramStyle)}
          className="mt-2 bg-zinc-950 border-zinc-700 border rounded-lg p-2 w-full text-white"
        >
          <option value="technical">Technical (black & white, precise)</option>
          <option value="schematic">Schematic (standard symbols)</option>
          <option value="blueprint">Blueprint (blue background)</option>
          <option value="modern">Modern (colorful, clean)</option>
          <option value="minimal">Minimal (simplified)</option>
        </select>
      </div>

      {/* Annotations Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="annotations"
          checked={config.annotations ?? true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleAnnotationsChange(e.target.checked)
          }
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="annotations" className="cursor-pointer">
          Include labels and measurements
        </label>
      </div>

      {/* Units (for CAD/Architecture) */}
      {needsUnits && (
        <div>
          <label className="text-base mb-3 block">Units</label>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                value="metric"
                id="metric"
                checked={config.units === "metric" || !config.units}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUnitsChange(e.target.value as UnitSystem)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="metric" className="cursor-pointer">
                Metric (mm, cm, m)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                value="imperial"
                id="imperial"
                checked={config.units === "imperial"}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUnitsChange(e.target.value as UnitSystem)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="imperial" className="cursor-pointer">
                Imperial (in, ft)
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlaceholder(diagramType: string): string {
  const placeholders: Record<string, string> = {
    microservices:
      "Example: API Gateway connecting to 3 microservices (Auth, Orders, Payments), each with its own PostgreSQL database and Redis cache...",
    topology:
      "Example: Corporate network with firewall, core switch, 3 access switches connected to 20 workstations, and a file server...",
    schematic:
      "Example: 555 timer circuit in astable mode with 10kΩ and 100kΩ resistors, 100µF capacitor, and LED output...",
    floorplan:
      "Example: 2-bedroom apartment with open-plan living room and kitchen, 2 bedrooms, 1 bathroom, total 900 sq ft...",
    mechanical:
      "Example: Mounting bracket with 4 M6 holes in corners, 100mm x 50mm x 5mm, steel construction...",
  };

  return (
    placeholders[diagramType] ||
    "Describe your diagram in detail, including components, connections, and any specific requirements..."
  );
}
