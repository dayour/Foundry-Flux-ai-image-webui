import { useState, useCallback } from "react";
import to from "await-to-js";
import { DiagramConfig } from "@/components/Generator/types";

export function useEngineeringDiagram() {
  const [generating, setGenerating] = useState(false);
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateDiagram = useCallback(async (config: DiagramConfig) => {
    setGenerating(true);
    setError(null);
    setDiagramUrl(null);
    setSvgUrl(null);

    const [err, response] = await to(fetch("/api/engineering/generate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    }));

    setGenerating(false);

    if (err || !response?.ok) {
      const errorData = await response?.json().catch(() => ({}));
      setError(errorData.error || "Diagram generation failed");
      return;
    }

    const data = await response.json();
    setDiagramUrl(data.imageUrl || null);
    setSvgUrl(data.svgUrl || null);
  }, []);

  const reset = useCallback(() => {
    setGenerating(false);
    setDiagramUrl(null);
    setSvgUrl(null);
    setError(null);
  }, []);

  return { generating, diagramUrl, svgUrl, error, generateDiagram, reset };
}
