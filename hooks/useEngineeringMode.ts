import { useState, useCallback } from "react";
import { DiagramConfig, DiagramCategory } from "@/types/engineering";
import { generateEngineeringDiagram } from "@/services/engineeringDiagram";

export function useEngineeringMode(userId: string) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DiagramCategory>("system");
  const [config, setConfig] = useState<Partial<DiagramConfig>>({
    style: "technical",
    annotations: true,
    units: "metric",
    description: "",
  });
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [generatedId, setGeneratedId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleTypeChange = useCallback((type: string, category: DiagramCategory) => {
    setSelectedType(type);
    setSelectedCategory(category);
    setConfig((prev) => ({
      ...prev,
      type,
      category,
    }));
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<DiagramConfig>) => {
    setConfig(newConfig);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!config.description || config.description.length < 10) {
      setError("Please provide a detailed description (at least 10 characters)");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const result = await generateEngineeringDiagram({
        config: {
          type: selectedType,
          category: selectedCategory,
          description: config.description,
          style: config.style || "technical",
          annotations: config.annotations ?? true,
          units: config.units,
          elements: config.elements,
        },
        userId,
        name: `${selectedType}-${Date.now()}`,
      });

      if (result.success) {
        setGeneratedImage(result.imageUrl);
        setGeneratedId(result.id);
      } else {
        setError(result.error || "Failed to generate diagram");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  }, [config, selectedType, selectedCategory, userId]);

  const reset = useCallback(() => {
    setGeneratedImage("");
    setGeneratedId("");
    setError("");
  }, []);

  const canGenerate = selectedType && config.description && config.description.length >= 10;

  return {
    selectedType,
    selectedCategory,
    config,
    generating,
    generatedImage,
    generatedId,
    error,
    canGenerate,
    handleTypeChange,
    handleConfigChange,
    handleGenerate,
    reset,
  };
}
