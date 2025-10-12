"use client";

import { useCallback, useEffect, useState } from "react";

export interface SyntheticAssetPreset {
    assetType: "person" | "place" | "object" | "memory" | "other";
    displayName: string;
    backstory: string;
    era: string;
    location: string;
    lighting: string;
    attire: string;
    mood: string;
    metadataNotes: string;
}

export interface GeneratorPreset {
    id: string;
    name: string;
    createdAt: string;
    prompt: string;
    aspectRatio: string;
    modelId: string;
    isPublic: boolean;
    options: Record<string, unknown>;
    syntheticAsset: SyntheticAssetPreset;
    builtIn?: boolean;
}

const STORAGE_KEY = "autogen.design.generator-presets.v1";

const defaultSyntheticAsset: SyntheticAssetPreset = {
    assetType: "person",
    displayName: "",
    backstory: "",
    era: "",
    location: "",
    lighting: "",
    attire: "",
    mood: "",
    metadataNotes: "",
};

const DEFAULT_PRESETS: GeneratorPreset[] = [
    {
        id: "builtin-flux-neon-hero",
        name: "Flux Neon Hero",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Pastel-neon AI studio overlooking a cyber skyline with autonomous agents collaborating across transparent holo-panels",
        aspectRatio: "16:9",
        modelId: "",
        isPublic: true,
        options: {
            category: "illustration",
            topic: "autonomous design lab",
            useCase: "hero",
            industry: "technology",
            audience: "creative-pros",
            format: "PNG",
            look: "cinematic",
            size: "1344×768",
            resolution: "hd",
            colorSpace: "Display P3",
            filter: "chromatic",
            isProMode: true,
            variationCount: 3,
            variationStrength: 45,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "place",
            displayName: "Flux Atrium",
            location: "Orbital Layer 7",
            era: "Late 2090s",
            lighting: "Pastel neon rim lighting with volumetric haze",
            mood: "Focused optimism",
            metadataNotes: "Include translucent UI elements and floating glass catwalks",
        },
        builtIn: true,
    },
    {
        id: "builtin-brand-deck",
        name: "Brand Deck Concept",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Minimalist pitch deck slide showcasing Autogen agents orchestrating product design workflows in cobalt and lilac",
        aspectRatio: "3:2",
        modelId: "",
        isPublic: true,
        options: {
            category: "branding",
            topic: "autonomous agents",
            useCase: "pitch-deck",
            industry: "consulting",
            audience: "enterprise",
            format: "PDF",
            look: "minimal",
            size: "1216×832",
            resolution: "hd",
            colorSpace: "sRGB",
            filter: "clean",
            isProMode: false,
            variationCount: 2,
            variationStrength: 25,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "object",
            displayName: "Autogen Workflow Board",
            metadataNotes: "Include modular cards, iconography for ideation, build, launch",
        },
        builtIn: true,
    },
    {
        id: "builtin-product-scribe",
        name: "Product Scribe",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Photoreal product vignette of an AI copilot device engraving blue light scripts into translucent material samples",
        aspectRatio: "1:1",
        modelId: "",
        isPublic: true,
        options: {
            category: "product",
            topic: "autogen flux hardware",
            useCase: "product-shot",
            industry: "hardware",
            audience: "designers",
            format: "JPEG",
            look: "photoreal",
            size: "1024×1024",
            resolution: "hd",
            colorSpace: "Adobe RGB",
            filter: "gloss",
            isProMode: true,
            variationCount: 4,
            variationStrength: 55,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "object",
            displayName: "Flux Scribe Device",
            lighting: "Studio rim light with cobalt reflections",
            metadataNotes: "Add interchangeable plates, etched circuitry",
        },
        builtIn: true,
    },
    {
        id: "builtin-memory-snapshot",
        name: "Memory Snapshot",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Dreamlike memory of a coastal cliff workshop where Autogen mentors teach apprentices with floating holo-scrolls",
        aspectRatio: "2:3",
        modelId: "",
        isPublic: false,
        options: {
            category: "concept",
            topic: "mentorship",
            useCase: "storyboard",
            industry: "education",
            audience: "students",
            format: "WEBP",
            look: "painterly",
            size: "832×1216",
            resolution: "sd",
            colorSpace: "sRGB",
            filter: "vintage",
            isProMode: false,
            variationCount: 3,
            variationStrength: 65,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "memory",
            displayName: "Coastal Atelier",
            backstory: "Flux founders host twilight ateliers for new agents",
            location: "Skylit cliffs of Azura",
            mood: "Nostalgic awe",
            metadataNotes: "Blend analog tools with holographic overlays",
        },
        builtIn: true,
    },
    {
        id: "builtin-tokyo-nights",
        name: "Tokyo Nights",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Neon-lit Tokyo street at night with holographic billboards, rain-slicked pavement reflecting pink and cyan lights, crowded with cyberpunk pedestrians",
        aspectRatio: "16:9",
        modelId: "",
        isPublic: true,
        options: {
            category: "photography",
            topic: "urban cyberpunk",
            useCase: "hero",
            industry: "entertainment",
            audience: "consumer",
            format: "JPEG",
            look: "cinematic",
            size: "1344×768",
            resolution: "hd",
            colorSpace: "Display P3",
            filter: "chromatic",
            isProMode: true,
            variationCount: 3,
            variationStrength: 50,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "place",
            displayName: "Shibuya Crossing 2098",
            location: "Neo-Tokyo district",
            era: "Late 21st century",
            lighting: "Neon signage with volumetric fog",
            mood: "Electric anticipation",
            metadataNotes: "Include kanji holograms, vending machines, umbrellas",
        },
        builtIn: true,
    },
    {
        id: "builtin-cartoon-hero",
        name: "Cartoon Hero",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Bold cartoon character in adventure pose with exaggerated proportions, vibrant flat colors, clean vector lines, expressive eyes, dynamic action background",
        aspectRatio: "1:1",
        modelId: "",
        isPublic: true,
        options: {
            category: "illustration",
            topic: "character design",
            useCase: "social",
            industry: "gaming",
            audience: "kids",
            format: "PNG",
            look: "minimal",
            size: "1024×1024",
            resolution: "hd",
            colorSpace: "sRGB",
            filter: "clean",
            isProMode: false,
            variationCount: 4,
            variationStrength: 60,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "person",
            displayName: "Flux Explorer",
            backstory: "Young inventor discovering new worlds with AI companions",
            attire: "Oversized goggles, utility belt, bright sneakers",
            mood: "Boundless curiosity",
            metadataNotes: "Thick outlines, no gradients, primary colors",
        },
        builtIn: true,
    },
    {
        id: "builtin-polaroid-memory",
        name: "Polaroid Memory",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Warm nostalgic scene framed as instant film photograph with creamy borders, soft focus, gentle grain, vintage color palette, everyday moment frozen in time",
        aspectRatio: "1:1",
        modelId: "",
        isPublic: true,
        options: {
            category: "photography",
            topic: "lifestyle snapshot",
            useCase: "social",
            industry: "lifestyle",
            audience: "families",
            format: "JPEG",
            look: "photoreal",
            size: "1024×1024",
            resolution: "sd",
            colorSpace: "sRGB",
            filter: "vintage",
            isProMode: false,
            variationCount: 2,
            variationStrength: 35,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "memory",
            displayName: "Summer Road Trip 1998",
            backstory: "Friends laughing at roadside diner, golden hour light streaming through windows",
            era: "Late 1990s",
            location: "Desert highway rest stop",
            lighting: "Natural golden hour with lens flare",
            mood: "Carefree nostalgia",
            metadataNotes: "Include slight overexposure, faded edges, handwritten date stamp",
        },
        builtIn: true,
    },
    {
        id: "builtin-90s-vibe",
        name: "90s Vibe",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Retro 90s aesthetic with VHS tracking glitches, neon geometric shapes, Memphis design patterns, chrome text effects, and bold contrasting colors",
        aspectRatio: "3:2",
        modelId: "",
        isPublic: true,
        options: {
            category: "branding",
            topic: "retro design",
            useCase: "poster",
            industry: "entertainment",
            audience: "creative-pros",
            format: "PNG",
            look: "retro",
            size: "1216×832",
            resolution: "hd",
            colorSpace: "sRGB",
            filter: "grain",
            isProMode: false,
            variationCount: 3,
            variationStrength: 55,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "object",
            displayName: "90s Design Explosion",
            metadataNotes: "Include squiggles, gradients, triangles, checkerboard patterns, holographic accents",
        },
        builtIn: true,
    },
    {
        id: "builtin-8bit-pixel",
        name: "8-Bit Pixel Art",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Classic 8-bit pixel art scene with limited color palette, chunky square pixels, retro gaming aesthetic, no anti-aliasing, crisp edges",
        aspectRatio: "1:1",
        modelId: "",
        isPublic: true,
        options: {
            category: "illustration",
            topic: "retro gaming",
            useCase: "thumbnail",
            industry: "gaming",
            audience: "gamers",
            format: "PNG",
            look: "sketch",
            size: "512×512",
            resolution: "sd",
            colorSpace: "sRGB",
            filter: "",
            isProMode: false,
            variationCount: 4,
            variationStrength: 45,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "object",
            displayName: "Pixel Dungeon",
            backstory: "Retro RPG scene with hero exploring treasure room",
            era: "1980s 8-bit era",
            metadataNotes: "Max 16-color palette, grid-based tiles, dithering for shading",
        },
        builtIn: true,
    },
    {
        id: "builtin-watercolor-dream",
        name: "Watercolor Dream",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Soft watercolor painting with flowing transparent washes, delicate paper texture, organic bleeding edges, pastel hues blending into white space",
        aspectRatio: "2:3",
        modelId: "",
        isPublic: true,
        options: {
            category: "illustration",
            topic: "botanical art",
            useCase: "poster",
            industry: "lifestyle",
            audience: "families",
            format: "PNG",
            look: "painterly",
            size: "832×1216",
            resolution: "hd",
            colorSpace: "Adobe RGB",
            filter: "",
            isProMode: false,
            variationCount: 2,
            variationStrength: 40,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "object",
            displayName: "Garden Flora",
            metadataNotes: "Include cotton paper texture, subtle granulation, loose expressive brushstrokes",
        },
        builtIn: true,
    },
    {
        id: "builtin-vaporwave-aesthetic",
        name: "Vaporwave Aesthetic",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Vaporwave scene with Greek statues, palm trees, sunset gradients in pink and turquoise, retro computer graphics, glitch art elements, and 80s nostalgia",
        aspectRatio: "16:9",
        modelId: "",
        isPublic: true,
        options: {
            category: "concept",
            topic: "vaporwave",
            useCase: "hero",
            industry: "entertainment",
            audience: "creative-pros",
            format: "PNG",
            look: "retro",
            size: "1344×768",
            resolution: "hd",
            colorSpace: "sRGB",
            filter: "chromatic",
            isProMode: true,
            variationCount: 3,
            variationStrength: 65,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "place",
            displayName: "Digital Paradise",
            location: "Virtual plaza suspended in cyberspace",
            era: "Eternal 1980s",
            lighting: "Gradient sunset with grid floor reflections",
            mood: "Melancholic serenity",
            metadataNotes: "Include wireframe grids, marble busts, Japanese text, dolphins",
        },
        builtIn: true,
    },
    {
        id: "builtin-film-noir",
        name: "Film Noir",
        createdAt: "2024-10-01T00:00:00.000Z",
        prompt: "Classic film noir scene with high contrast black and white, dramatic shadows from venetian blinds, moody detective in fedora, smoke-filled room",
        aspectRatio: "3:2",
        modelId: "",
        isPublic: true,
        options: {
            category: "photography",
            topic: "crime drama",
            useCase: "storyboard",
            industry: "entertainment",
            audience: "b2b",
            format: "JPEG",
            look: "noir",
            size: "1216×832",
            resolution: "hd",
            colorSpace: "sRGB",
            filter: "mono",
            isProMode: true,
            variationCount: 2,
            variationStrength: 30,
        },
        syntheticAsset: {
            ...defaultSyntheticAsset,
            assetType: "person",
            displayName: "Detective Cross",
            backstory: "Hard-boiled investigator piecing together clues in dimly lit office",
            era: "1940s Los Angeles",
            location: "Rain-soaked downtown precinct",
            lighting: "Single desk lamp creating hard shadows",
            attire: "Trench coat, fedora, loosened tie",
            mood: "Cynical determination",
            metadataNotes: "Include venetian blind shadows, cigarette smoke, vintage rotary phone",
        },
        builtIn: true,
    },
];

export function useGeneratorPresets() {
    const [presets, setPresets] = useState<GeneratorPreset[]>(DEFAULT_PRESETS);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                setPresets([...DEFAULT_PRESETS]);
                return;
            }
            const parsed = JSON.parse(stored) as GeneratorPreset[];
            if (Array.isArray(parsed)) {
                const normalised = parsed.map((preset) => ({
                    ...preset,
                    syntheticAsset: {
                        ...defaultSyntheticAsset,
                        ...(preset.syntheticAsset ?? {}),
                    },
                    builtIn: false,
                }));
                setPresets([...DEFAULT_PRESETS, ...normalised]);
            } else {
                setPresets([...DEFAULT_PRESETS]);
            }
        } catch (error) {
            console.warn("Failed to parse generator presets", error);
            setPresets([...DEFAULT_PRESETS]);
        }
    }, []);

    const persist = useCallback((userPresets: GeneratorPreset[]) => {
        const sanitised = userPresets.map((preset) => ({
            ...preset,
            builtIn: false,
            syntheticAsset: {
                ...defaultSyntheticAsset,
                ...(preset.syntheticAsset ?? {}),
            },
        }));
        setPresets([...DEFAULT_PRESETS, ...sanitised]);
        if (typeof window === "undefined") {
            return;
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitised));
        } catch (error) {
            console.warn("Failed to persist generator presets", error);
        }
    }, []);

    const savePreset = useCallback(
        (preset: Omit<GeneratorPreset, "id" | "createdAt">) => {
            const id = typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            const createdAt = new Date().toISOString();
            const fullPreset: GeneratorPreset = {
                id,
                createdAt,
                ...preset,
                syntheticAsset: {
                    ...defaultSyntheticAsset,
                    ...preset.syntheticAsset,
                },
                builtIn: false,
            };
            const userPresets = presets.filter((entry) => !entry.builtIn);
            persist([fullPreset, ...userPresets]);
            return fullPreset;
        },
        [persist, presets]
    );

    const deletePreset = useCallback(
        (id: string) => {
            const userPresets = presets.filter((preset) => !preset.builtIn && preset.id !== id);
            persist(userPresets);
        },
        [persist, presets]
    );

    const renamePreset = useCallback(
        (id: string, name: string) => {
            const userPresets = presets.filter((preset) => !preset.builtIn);
            const renamed = userPresets.map((preset) =>
                preset.id === id
                    ? {
                          ...preset,
                          name,
                      }
                    : preset
            );
            persist(renamed);
        },
        [persist, presets]
    );

    return {
        presets,
        savePreset,
        deletePreset,
        renamePreset,
    };
}

export function createPresetPayload(): GeneratorPreset {
    return {
        id: "",
        name: "",
        createdAt: new Date().toISOString(),
        prompt: "",
        aspectRatio: "1:1",
        modelId: "",
        isPublic: true,
        options: {},
        syntheticAsset: { ...defaultSyntheticAsset },
    };
}
