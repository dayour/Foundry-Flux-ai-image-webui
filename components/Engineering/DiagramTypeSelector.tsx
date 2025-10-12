"use client";

import React, { useState } from "react";
import { DiagramType } from "@/components/Generator/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Network, CircuitBoard, GitBranch, Home, Box, Workflow } from "lucide-react";

const DIAGRAM_TYPES: DiagramType[] = [
  { category: "system", subcategory: "microservices", description: "Microservices architecture with services, APIs, databases", outputFormat: ["svg","png","pdf"], icon: GitBranch },
  { category: "system", subcategory: "data-flow", description: "Data flow diagram (DFD)", outputFormat: ["svg","png","pdf"], icon: Workflow },
  { category: "network", subcategory: "topology", description: "Network topology", outputFormat: ["svg","png","pdf","vsdx"], icon: Network },
  { category: "network", subcategory: "rack-diagram", description: "Server rack layout", outputFormat: ["svg","png","pdf"], icon: Box },
  { category: "circuit", subcategory: "schematic", description: "Electronic circuit schematic", outputFormat: ["svg","png","pdf","dxf"], icon: CircuitBoard },
  { category: "circuit", subcategory: "pcb-layout", description: "PCB layout", outputFormat: ["svg","png","pdf","gerber"], icon: CircuitBoard },
  { category: "flowchart", subcategory: "process", description: "Business process flowchart", outputFormat: ["svg","png","pdf"], icon: Workflow },
  { category: "flowchart", subcategory: "uml", description: "UML diagrams", outputFormat: ["svg","png","pdf","plantuml"], icon: GitBranch },
  { category: "architecture", subcategory: "floorplan", description: "Architectural floor plan", outputFormat: ["svg","png","pdf","dxf"], icon: Home },
  { category: "architecture", subcategory: "isometric", description: "Isometric technical drawing", outputFormat: ["svg","png","pdf"], icon: Box },
  { category: "cad", subcategory: "mechanical", description: "Mechanical part drawing with dimensions", outputFormat: ["svg","png","pdf","dxf","step"], icon: Box },
  { category: "cad", subcategory: "assembly", description: "Assembly drawing (exploded view)", outputFormat: ["svg","png","pdf","dxf"], icon: Box }
];

const CATEGORIES = ["system","network","circuit","flowchart","architecture","cad"];

interface Props { selectedType: string; onSelectType: (type:string) => void }

export function DiagramTypeSelector({ selectedType, onSelectType }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("system");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Diagram Type</h3>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} className={cn("px-4 py-2 rounded-lg capitalize transition-all whitespace-nowrap", selectedCategory===cat?"bg-gradient-to-r from-purple-500 to-cyan-500 text-white":"bg-zinc-800 hover:bg-zinc-700")} onClick={()=>setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIAGRAM_TYPES.filter(d=>d.category===selectedCategory).map(diagram => {
            const Icon = diagram.icon as any;
            return (
              <button key={diagram.subcategory} onClick={() => onSelectType(diagram.subcategory)} className={cn("p-4 rounded-lg border-2 text-left transition-all", selectedType===diagram.subcategory?"border-purple-500 bg-purple-500/10":"border-zinc-700 hover:border-zinc-600")}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    {Icon ? <Icon className="w-5 h-5" /> : null}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold capitalize mb-1">{diagram.subcategory.replace(/-/g, ' ')}</h4>
                    <p className="text-xs text-zinc-400">{diagram.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {diagram.outputFormat.map((format:string) => <Badge key={format} variant="outline" className="text-xs">{format.toUpperCase()}</Badge>)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
