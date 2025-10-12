import type { SyntheticAssetPreset } from "@/hooks/useGeneratorPresets";
import type { GenerationMode } from "@/components/Generator/types";

interface BuildGenerationPromptOptions {
	basePrompt: string;
	mode: GenerationMode;
	aspectRatio?: string;
	modelLabel?: string;
	options?: Partial<{
		category: string;
		topic: string;
		useCase: string;
		industry: string;
		audience: string;
		format: string;
		look: string;
		size: string;
		resolution: string;
		colorSpace: string;
		filter: string;
		isProMode: boolean;
		variationStrength: number;
		presetName: string;
	}>;
	syntheticAsset?: SyntheticAssetPreset;
}

const SPECIAL_LABELS: Record<string, string> = {
	uiux: "UI/UX",
	"pitch-deck": "Pitch Deck",
	"product-shot": "Product Shot",
	"storyboard": "Storyboard",
	b2b: "B2B",
	b2c: "B2C",
	srgb: "sRGB",
	"adobe rgb": "Adobe RGB",
	"display p3": "Display P3",
	hd: "HD",
	sd: "SD",
	"4k": "4K",
	png: "PNG",
	jpeg: "JPEG",
	jpg: "JPG",
	webp: "WEBP",
	pdf: "PDF",
	pro: "Pro",
	noir: "Noir",
};

const MODE_SUMMARY: Record<GenerationMode, string> = {
	images: "High fidelity still imagery with emphasis on art direction and storytelling.",
	video: "Animated or sequential visuals suited for motion graphics or video storyboards.",
	synthetic: "Synthetic dataset imagery focused on controlled variation for evaluation.",
	brand: "Brand system visuals that reinforce identity, consistency, and style guidelines.",
	engineering: "Technical or diagrammatic imagery prioritizing clarity, accuracy, and specifications.",
};

const LOOK_DESCRIPTIONS: Record<string, string> = {
	photoreal: "Photorealistic rendering with accurate materials and lighting.",
	cinematic: "Cinematic composition with dramatic lighting and depth of field.",
	minimal: "Minimalist composition with ample negative space and clean typography.",
	painterly: "Painterly strokes, organic textures, and analog nuance.",
	modern: "Modern visual language with contemporary styling and polish.",
	retro: "Retro-inspired styling with nostalgic motifs and palettes.",
	sketch: "Sketch or line-art aesthetic with hand-drawn qualities.",
	noir: "High-contrast noir styling with dramatic shadows and monochrome palette.",
};

const FILTER_DESCRIPTIONS: Record<string, string> = {
	vintage: "Apply vintage toning with softened highlights and gentle grain.",
	cinematic: "Layer cinematic grading with rich contrast and teal/orange balance.",
	mono: "Convert to monochrome with balanced mid-tones and preserved detail.",
	chromatic: "Introduce chromatic aberration and subtle bloom for futuristic FX.",
	clean: "Keep post-processing clean and crisp with minimal artifacts.",
	gloss: "Enhance glossy reflections and polished surfaces.",
	grain: "Add controlled film grain for texture and mood.",
};

function titleise(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	const lower = trimmed.toLowerCase();
	if (SPECIAL_LABELS[lower]) return SPECIAL_LABELS[lower];
	return trimmed
		.split(/[-_/]/g)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join(" ");
}

function describeVariationStrength(value?: number): string | undefined {
	if (value === undefined || Number.isNaN(value)) return undefined;
	const bounded = Math.max(0, Math.min(100, value));
	if (bounded <= 25) return `Variation strength ${bounded}% — keep iterations very close to the prompt.`;
	if (bounded <= 50) return `Variation strength ${bounded}% — allow moderate creative exploration while staying on brief.`;
	if (bounded <= 75) return `Variation strength ${bounded}% — encourage bold reinterpretations still anchored to the brief.`;
	return `Variation strength ${bounded}% — explore wide creative deviations while honoring core constraints.`;
}

function buildSyntheticAssetSection(asset?: SyntheticAssetPreset): string | undefined {
	if (!asset) return undefined;
	const fields: string[] = [];
	if (asset.displayName) fields.push(`Name: ${asset.displayName}`);
	if (asset.assetType) fields.push(`Type: ${titleise(asset.assetType)}`);
	if (asset.backstory) fields.push(`Backstory: ${asset.backstory}`);
	if (asset.era) fields.push(`Era: ${asset.era}`);
	if (asset.location) fields.push(`Location: ${asset.location}`);
	if (asset.lighting) fields.push(`Lighting: ${asset.lighting}`);
	if (asset.attire) fields.push(`Attire / materials: ${asset.attire}`);
	if (asset.mood) fields.push(`Mood: ${asset.mood}`);
	if (asset.metadataNotes) fields.push(`Additional directives: ${asset.metadataNotes}`);
	if (fields.length === 0) return undefined;
	return `Synthetic asset briefing:\n- ${fields.join("\n- ")}`;
}

export function buildGenerationPrompt({
	basePrompt,
	mode,
	aspectRatio,
	modelLabel,
	options,
	syntheticAsset,
}: BuildGenerationPromptOptions): string {
	const promptSections: string[] = [];

	const trimmedBase = basePrompt.trim();
	if (trimmedBase) {
		promptSections.push(trimmedBase);
	}

	const modeSummary = MODE_SUMMARY[mode];
	if (modeSummary) {
		promptSections.push(`Mode focus: ${modeSummary}`);
	}

	const projectDetails: string[] = [];
	if (options?.category) projectDetails.push(`Category: ${titleise(options.category)}`);
	if (options?.useCase) projectDetails.push(`Use case: ${titleise(options.useCase)}`);
	if (options?.topic) projectDetails.push(`Topic/theme: ${titleise(options.topic)}`);
	if (options?.industry) projectDetails.push(`Industry context: ${titleise(options.industry)}`);
	if (options?.audience) projectDetails.push(`Target audience: ${titleise(options.audience)}`);
	if (options?.presetName) projectDetails.push(`Applied preset: ${options.presetName}`);
	if (projectDetails.length > 0) {
		promptSections.push(`Project intent:\n- ${projectDetails.join("\n- ")}`);
	}

	const artDirection: string[] = [];
	if (options?.look) {
		const lookKey = options.look.toLowerCase();
		artDirection.push(LOOK_DESCRIPTIONS[lookKey] ?? `Look & feel: ${titleise(options.look)}`);
	}
	if (options?.filter) {
		const filterKey = options.filter.toLowerCase();
		artDirection.push(FILTER_DESCRIPTIONS[filterKey] ?? `Post-processing filter: ${titleise(options.filter)}`);
	}
	if (options?.colorSpace) artDirection.push(`Color space: ${titleise(options.colorSpace)}`);
	if (options?.isProMode) artDirection.push("Apply pro-level detailing, refined finishing, and production-ready polish.");
	const variationDescriptor = describeVariationStrength(options?.variationStrength);
	if (variationDescriptor) artDirection.push(variationDescriptor);
	if (artDirection.length > 0) {
		promptSections.push(`Creative direction:\n- ${artDirection.join("\n- ")}`);
	}

	const outputSpecs: string[] = [];
	if (aspectRatio) outputSpecs.push(`Aspect ratio: ${aspectRatio}`);
	if (options?.size) outputSpecs.push(`Base resolution target: ${options.size}`);
	if (options?.resolution) outputSpecs.push(`Quality mode: ${titleise(options.resolution)}`);
	if (options?.format) outputSpecs.push(`Preferred output format: ${titleise(options.format)}`);
	if (modelLabel) outputSpecs.push(`Model: ${modelLabel}`);
	if (outputSpecs.length > 0) {
		promptSections.push(`Output specifications:\n- ${outputSpecs.join("\n- ")}`);
	}

	const syntheticSection = buildSyntheticAssetSection(syntheticAsset);
	if (syntheticSection) {
		promptSections.push(syntheticSection);
	}

	promptSections.push("Honor all constraints above while keeping composition coherent, legible, and production-ready.");

	return promptSections.join("\n\n");
}
