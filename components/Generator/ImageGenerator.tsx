/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */
"use client";

import {
    ChangeEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";
import { Icons } from "@/components/Icons";
import { usePrediction } from "@/hooks/usePrediction";
import LoginDialog from "@/components/LoginBox/LoginDialog";
import { onDownload, outOfFree } from "@/lib/utils";
import styles from "./ImageGenerator.module.css";
// import * as Select from "@radix-ui/react-select";
// import { useClipboard } from "@/hooks/useClipboard";
import { useTranslations } from "next-intl";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css'
import StorageSwitcher from "@/components/Storage/StorageSwitcher";
import ModelSettingsDialog from "./ModelSettingsDialog";
import type { GeneratorModelOption } from "./types";
import { ImageIcon, List, Settings, SquareMousePointer } from "lucide-react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import ApplicationsOf from "@/components/Applications/ApplicationsOf";
import SkeletonLoader from "@/components/Shared/SkeletonLoader";
import ImageToolbar from "@/components/Toolbars/ImageToolbar";
import Image from "next/image";
import GuidedTour from "@/components/Onboarding/GuidedTour";
import { GenerationResult, PredictionRequest, PredictionStatus } from "@/hooks/usePrediction";
import { useGeneratorPresets, SyntheticAssetPreset } from "@/hooks/useGeneratorPresets";
import { cn } from "@/lib/utils";
import { buildGenerationPrompt } from "@/lib/promptBuilder";
import GenerationModeSwitcher from "./GenerationModeSwitcher";
import { GenerationMode } from "./types";
import { DiagramTypeSelector } from "@/components/Engineering/DiagramTypeSelector";
import { DiagramDescriptionInput } from "@/components/Engineering/DiagramDescriptionInput";
import { useEngineeringDiagram } from "@/hooks/useEngineeringDiagram";
import type { DiagramConfig } from "@/components/Generator/types";
import { isControlEnabled } from "./generationModes";

interface GeneratorUser extends Record<string, unknown> {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    credits?: number | null;
}

interface AspectRatioOption {
    label: string;
    ratio: string;
    id: string;
    checked: boolean;
    disabled?: boolean;
}

interface ImageGeneratorProps {
    user?: GeneratorUser | null;
}

const DEFAULT_SYNTHETIC_ASSET: SyntheticAssetPreset = {
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

const STATUS_COPY: Record<PredictionStatus, { label: string; helper: string }> = {
    queued: {
        label: "Queued",
        helper: "Awaiting an open Flux render slot",
    },
    starting: {
        label: "Spinning up",
        helper: "Allocating GPU + loading model weights",
    },
    processing: {
        label: "Synthesising",
        helper: "Generating high-fidelity variations",
    },
    succeeded: {
        label: "Completed",
        helper: "All variations ready to review",
    },
    failed: {
        label: "Failed",
        helper: "Try increasing guidance or reducing resolution",
    },
    canceled: {
        label: "Cancelled",
        helper: "Request was stopped before completion",
    },
};

const ImageGenerator = ({ user }: ImageGeneratorProps) => {
    const leftElementRef = useRef<HTMLDivElement | null>(null);
    const [elementHeight, setElementHeight] = useState(0);
    const [generating, setGenerating] = useState(false);
    const [openLogin, setOpenLogin] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [textPrompts, setTextPrompts] = useState("");
    const [aspectRatio, setAspectRatio] = useState<AspectRatioOption[]>([
        { label: "1:1", ratio: "1:1", id: "ratio-1-1", checked: true },
        {
            label: "16:9",
            ratio: "16:9",
            id: "ratio-16-9",
            checked: false,
            // disabled: user?.credits <= 1,
        },
        {
            label: "9:16",
            ratio: "9:16",
            id: "ratio-9-16",
            checked: false,
            // disabled: user?.credits <= 1,
        },
        {
            label: "3:2",
            ratio: "3:2",
            id: "ratio-3-2",
            checked: false,
            // disabled: user?.credits <= 1,
        },
        {
            label: "2:3",
            ratio: "2:3",
            id: "ratio-2-3",
            checked: false,
            // disabled: user?.credits <= 1,
        },
    ]);
    const [models, setModels] = useState<GeneratorModelOption[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string>("");
    const [loadingModels, setLoadingModels] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    // New generation options
    const [showMore, setShowMore] = useState(false);
    const [isProMode, setIsProMode] = useState(false);
    const [category, setCategory] = useState<string>("");
    const [topic, setTopic] = useState<string>("");
    const [useCase, setUseCase] = useState<string>("");
    const [industry, setIndustry] = useState<string>("");
    const [audience, setAudience] = useState<string>("");
    const [format, setFormat] = useState<string>("PNG");
    const [look, setLook] = useState<string>("");
    const [sizeLabel, setSizeLabel] = useState<string>("1024×1024");
    const [resolution, setResolution] = useState<string>("hd");
    const [colorSpace, setColorSpace] = useState<string>("sRGB");
    const [filter, setFilter] = useState<string>("");
    const { error, prediction, generations, statusTrail, handleSubmit } = usePrediction();
    const { presets, savePreset, deletePreset, renamePreset } = useGeneratorPresets();
    const [activeGenerationIndex, setActiveGenerationIndex] = useState(0);
    const [variationCount, setVariationCount] = useState<number>(1);
    const [variationStrength, setVariationStrength] = useState<number>(35);
    const [selectedPresetId, setSelectedPresetId] = useState<string>("");
    const [presetName, setPresetName] = useState<string>("");
    const [syntheticAsset, setSyntheticAsset] = useState<SyntheticAssetPreset>({
        ...DEFAULT_SYNTHETIC_ASSET,
    });
    const [hasAcceptedTos, setHasAcceptedTos] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            return false;
        }
        return window.localStorage.getItem("autogen.design.tos") === "true";
    });
    const [lastRequest, setLastRequest] = useState<PredictionRequest | null>(null);
    const [generationMode, setGenerationMode] = useState<GenerationMode>("images");
    const engineeringDiagram = useEngineeringDiagram();
    const [diagramConfig, setDiagramConfig] = useState<DiagramConfig>({
        type: "microservices",
        category: "system",
        description: "",
        style: "technical",
        annotations: true,
        units: "metric",
    });
    const t = useTranslations("Generation");

    useLayoutEffect(() => {
        if (leftElementRef.current) {
            setElementHeight(leftElementRef.current.clientHeight);
        }
    }, []);

    useEffect(() => {
        if (!generations.length) {
            setActiveGenerationIndex(0);
        } else {
            setActiveGenerationIndex((index) => Math.min(index, generations.length - 1));
        }
    }, [generations.length]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        window.localStorage.setItem("autogen.design.tos", hasAcceptedTos ? "true" : "false");
    }, [hasAcceptedTos]);

    const activeGeneration = useMemo(() => {
        if (!generations.length) {
            return null;
        }
        const index = Math.min(activeGenerationIndex, generations.length - 1);
        return generations[index];
    }, [activeGenerationIndex, generations]);

    const selectedPreset = useMemo(
        () => presets.find((item) => item.id === selectedPresetId),
        [presets, selectedPresetId]
    );
    const selectedPresetIsBuiltIn = selectedPreset?.builtIn ?? false;

    const thumbnails = useMemo(() => {
        if (generations.length <= 1) {
            return [] as Array<GenerationResult & { localIndex: number }>;
        }
        return generations.map((item, index) => ({ ...item, localIndex: index }));
    }, [generations]);

    const hasGenerations = Boolean(activeGeneration);

    const timeline = useMemo(() => {
        const ordered: PredictionStatus[] = ["queued", "starting", "processing", "succeeded"];
        return ordered.map((status) => ({
            status,
            label: STATUS_COPY[status].label,
            helper: STATUS_COPY[status].helper,
            reached: statusTrail.includes(status) || prediction?.status === status,
        }));
    }, [prediction?.status, statusTrail]);

    const hasFailure = useMemo(() => {
        return prediction?.status === "failed" || statusTrail.includes("failed") || !!error;
    }, [error, prediction?.status, statusTrail]);

    const failureMessage = useMemo(() => {
        return error ?? prediction?.detail ?? prediction?.error ?? "Image failed — try increasing guidance or lowering size.";
    }, [error, prediction?.detail, prediction?.error]);

    const displaySkeleton = generating && !hasGenerations;

    const FORM_SECTION_CLASS = "rounded-2xl border border-white/12 bg-white/6 p-5 shadow-[0_12px_32px_rgba(6,11,25,0.18)] backdrop-blur";

    const samplePrompts = useMemo(
        () => [
            "Ultra-detailed product hero in glass, chrome, and holographic glow",
            "Creative team collaborating in a luminous AI control room",
            "Atmospheric skyline of autonomous drones over neon rooftops",
            "Immersive UX dashboard rendered in cinematic volumetric lighting",
        ],
        []
    );

    const applySamplePrompt = useCallback((prompt: string) => {
        setTextPrompts(prompt);
    }, []);

    const updateSyntheticAsset = useCallback(
        <Key extends keyof SyntheticAssetPreset>(field: Key, value: SyntheticAssetPreset[Key]) => {
            setSyntheticAsset((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    const refreshModels = useCallback(async () => {
        setLoadingModels(true);
        try {
            const response = await fetch("/api/models");
            const data: unknown = await response.json();

            if (!data || typeof data !== "object" || !("success" in data)) {
                throw new Error("Unexpected response when loading models");
            }

            const { success, error: message, models: rawModels } = data as {
                success?: boolean;
                error?: string;
                models?: GeneratorModelOption[];
            };

            if (!success || !Array.isArray(rawModels)) {
                throw new Error(message || "Failed to load models");
            }

            const fetched: GeneratorModelOption[] = rawModels.map((item) => ({
                id: item.id,
                label: item.label,
                description: item.description,
                quality: item.quality,
                enabled: item.enabled,
                endpoint: item.endpoint,
                apiKey: item.apiKey,
                provider: item.provider,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }));

            setModels(fetched);
            setSelectedModelId((prev) => {
                if (
                    prev &&
                    fetched.some(
                        (model) => model.id === prev && model.enabled
                    )
                ) {
                    return prev;
                }

                const firstEnabled = fetched.find((model) => model.enabled);
                return firstEnabled?.id ?? "";
            });
        } catch (fetchError: unknown) {
            const message = fetchError instanceof Error ? fetchError.message : "Failed to load models";
            console.error("Failed to fetch models", fetchError);
            toast.error("Failed to load models. Please check configuration.");
            setModels([]);
            setSelectedModelId("");
        } finally {
            setLoadingModels(false);
        }
    }, []);

    useEffect(() => {
        refreshModels();
    }, [refreshModels]);

    const enabledModels = useMemo(
        () => models.filter((model) => model.enabled),
        [models]
    );

    // handle Generative
    const handleGenerative = async () => {
        if (generating) {
            return;
        }

        if (!user) {
            setOpenLogin(true);
            return false;
        }

        const prompt = textPrompts.trim();
        if (!prompt) {
            toast.error("Please enter the prompt word!");
            return;
        }

        if (!hasAcceptedTos) {
            toast.error("Please acknowledge the usage terms before generating.");
            return;
        }

        const activeModel = models.find((model) => model.id === selectedModelId && model.enabled);
        if (!activeModel) {
            toast.error("No models available. Please configure one first.");
            return;
        }

        const ratioSelection = aspectRatio.find((item) => item.checked)?.ratio ?? "1:1";
        const refinedPrompt = buildGenerationPrompt({
            basePrompt: prompt,
            mode: generationMode,
            aspectRatio: ratioSelection,
            modelLabel: activeModel.label,
            options: {
                category,
                topic,
                useCase,
                industry,
                audience,
                format,
                look,
                size: sizeLabel,
                resolution,
                colorSpace,
                filter,
                isProMode,
                variationStrength,
                presetName: selectedPreset?.name,
            },
            syntheticAsset,
        });

        setGenerating(true);
        try {
            const request: PredictionRequest = {
                prompts: refinedPrompt,
                ratio: ratioSelection,
                model: activeModel.id,
                isPublic,
                user: user ?? null,
                options: {
                    rawPrompt: prompt,
                    refinedPrompt,
                    category,
                    topic,
                    useCase,
                    industry,
                    audience,
                    format,
                    look,
                    size: sizeLabel,
                    resolution,
                    colorSpace,
                    filter,
                    isProMode,
                    variationCount,
                    variationStrength,
                    syntheticAsset,
                    presetId: selectedPresetId || undefined,
                    presetName: selectedPreset?.name,
                    generationMode,
                    // TODO: Wire variationCount + variationStrength into Azure Flux multi-variation payload once backend supports it.
                },
            };

            setLastRequest(request);
            setImageLoading(true);
            await handleSubmit(request);
        } catch (submitError: unknown) {
            const message = submitError instanceof Error ? submitError.message : "Failed to start generation. Please try again.";
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    };

    const handleRetry = useCallback(async () => {
        if (!lastRequest) {
            toast.error("No previous request to retry.");
            return;
        }

        setGenerating(true);
        try {
            setImageLoading(true);
            await handleSubmit(lastRequest);
        } catch (retryError: unknown) {
            const message = retryError instanceof Error ? retryError.message : "Retry failed. Please adjust your prompt.";
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    }, [handleSubmit, lastRequest]);

    const handlePresetSelect = useCallback((presetId: string) => {
        setSelectedPresetId(presetId);
        if (!presetId) {
            return;
        }

        const preset = presets.find((item) => item.id === presetId);
        if (!preset) {
            return;
        }

        setTextPrompts(preset.prompt ?? "");
        setAspectRatio((options) =>
            options.map((option) => ({
                ...option,
                checked: option.ratio === preset.aspectRatio,
            }))
        );
        setSelectedModelId(preset.modelId ?? "");
        setIsPublic(!!preset.isPublic);

        const opts = preset.options ?? {};
        setCategory(String(opts.category ?? ""));
        setTopic(String(opts.topic ?? ""));
        setUseCase(String(opts.useCase ?? ""));
        setIndustry(String(opts.industry ?? ""));
        setAudience(String(opts.audience ?? ""));
        setFormat(String(opts.format ?? "PNG"));
        setLook(String(opts.look ?? ""));
        setSizeLabel(String(opts.size ?? "1024×1024"));
        setResolution(String(opts.resolution ?? "hd"));
        setColorSpace(String(opts.colorSpace ?? "sRGB"));
        setFilter(String(opts.filter ?? ""));
        setIsProMode(Boolean(opts.isProMode ?? false));
        setVariationCount(Number(opts.variationCount ?? 1));
        setVariationStrength(Number(opts.variationStrength ?? 35));
        setShowMore(true);
        setSyntheticAsset({
            ...DEFAULT_SYNTHETIC_ASSET,
            ...(preset.syntheticAsset ?? {}),
        });
        setPresetName(preset.builtIn ? "" : preset.name ?? "");
        toast.success(`Applied preset “${preset.name}”`);
    }, [presets]);

    const handleSavePreset = useCallback(() => {
        const name = presetName.trim();
        if (!name) {
            toast.error("Name your preset before saving.");
            return;
        }
        if (!textPrompts.trim()) {
            toast.error("Add a prompt before saving a preset.");
            return;
        }

        const saved = savePreset({
            name,
            prompt: textPrompts,
            aspectRatio: aspectRatio.find((item) => item.checked)?.ratio ?? "1:1",
            modelId: selectedModelId,
            isPublic,
            options: {
                category,
                topic,
                useCase,
                industry,
                audience,
                format,
                look,
                size: sizeLabel,
                resolution,
                colorSpace,
                filter,
                isProMode,
                variationCount,
                variationStrength,
            },
            syntheticAsset: { ...syntheticAsset },
        });

        setPresetName("");
        setSelectedPresetId(saved.id);
        toast.success("Preset saved locally.");
    }, [
        aspectRatio,
        audience,
        category,
        colorSpace,
        filter,
        format,
        industry,
        isProMode,
        isPublic,
        look,
        presetName,
    resolution,
        savePreset,
        selectedModelId,
        sizeLabel,
        syntheticAsset,
        textPrompts,
        topic,
        useCase,
        variationCount,
        variationStrength,
    ]);

    const handleRenamePreset = useCallback(() => {
        if (!selectedPresetId) {
            toast.error("Select a preset to rename.");
            return;
        }
        const name = presetName.trim();
        if (!name) {
            toast.error("Enter a new name to rename the preset.");
            return;
        }
        if (selectedPreset?.builtIn) {
            toast.error("Default presets cannot be renamed. Save a copy instead.");
            return;
        }
        renamePreset(selectedPresetId, name);
        toast.success("Preset renamed.");
        setPresetName("");
    }, [presetName, renamePreset, selectedPreset, selectedPresetId]);

    const handleDeletePresetClick = useCallback(() => {
        if (!selectedPresetId) {
            return;
        }
        if (selectedPreset?.builtIn) {
            toast.error("Default presets cannot be deleted.");
            return;
        }
        deletePreset(selectedPresetId);
        setSelectedPresetId("");
        setPresetName("");
        toast.success("Preset removed.");
    }, [deletePreset, selectedPreset, selectedPresetId]);

    const handleShare = async (
        social: string,
        imageUrl?: string
    ) => {
        // 用户登录检测
        if (!user) {
            // console.info("Run out of free", outOfFree());
            setOpenLogin(true);
            return false;
        }

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const shareImage = imageUrl ?? activeGeneration?.url ?? "";

        let url = "";
        switch (social) {
            case "x":
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    origin
                )}&text=Check%20this%20image%20generated%20with%20Autogen%20Design&hashtags=AutogenDesign%2CAI`;
                break;
            case "linkedin":
                url = `https://www.linkedin.com/sharing/share-offsite?url=${encodeURIComponent(
                    origin
                )}`;
                break;
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    origin
                )}&lang=en&quote=Check%20this%20image%20generated%20with%20AI&hashtag=#Flux,#Image Generator,#AI`;
                break;
            case "instagram":
                url = `https://www.instagram.com/share?url=${encodeURIComponent(
                    origin
                )}`;
                break;
            case "reddit":
                url = `https://www.reddit.com/submit?url=${encodeURIComponent(
                    origin
                )}&title=Check%20this%20image%20generated%20with%20AI`;
                break;
            case "pinterest":
                url = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
                    origin
                )}&media=${shareImage}&description=Check%20this%20image%20generated%20with%20AI`;
                break;

            default:
                break;
        }

        window.open(url, "_blank");
    };

    const handleDownload = async (
        targetUrl: string | undefined,
        onDownloaded: () => void
    ) => {
        // 用户登录检测
        if (!user) {
            // console.info("Run out of free", outOfFree());
            setOpenLogin(true);
            return false;
        }
        // window.open(generation.url, "_blank");
        if (!targetUrl) {
            toast.error("Generate an image before downloading.");
            return;
        }

        onDownload(targetUrl, onDownloaded);
    // legacy example: onDownload(`autogen/generated/CQHex-1a.jpg`)
    };

    const handleMaximize = (shouldZoom: boolean) => {
        setIsZoomed(true);
    };
    // const [isZoomed, setIsZoomed] = useState(false);

    // const handleMaximize = useCallback((shouldZoom: any) => {
    //     setIsZoomed(shouldZoom);
    // }, []);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleZoomChange = useCallback((shouldZoom: boolean) => {
        setIsZoomed(shouldZoom);
    }, []);

    return (
        <>
            <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                {/* Generation Mode Switcher */}
                <GenerationModeSwitcher
                    currentMode={generationMode}
                    onModeChange={setGenerationMode}
                    className="mb-8"
                />
                
                <div className="lg:grid lg:grid-cols-12 lg:gap-16">
                    <div
                        className="lg:col-span-7 space-y-6"
                        ref={leftElementRef}
                    >
                                                {/* form section */}
                                                {generationMode === "engineering" && (
                                                <div className="space-y-6">
                                                    <DiagramTypeSelector selectedType={diagramConfig.type} onSelectType={(type) => {
                                                            // derive category from built-in list quickly
                                                            const category = type === "microservices" || type === "data-flow" ? "system" : (type === "topology" || type === "rack-diagram" ? "network" : (type === "schematic" || type === "pcb-layout" ? "circuit" : (type === "process" || type === "uml" ? "flowchart" : (type === "floorplan" || type === "isometric" ? "architecture" : "cad"))));
                                                            setDiagramConfig(prev => ({ ...prev, type, category }));
                                                    }} />

                                                    <DiagramDescriptionInput
                                                        diagramType={diagramConfig.type}
                                                        description={diagramConfig.description}
                                                        style={diagramConfig.style}
                                                        annotations={diagramConfig.annotations}
                                                        units={diagramConfig.units || "metric"}
                                                        onDescriptionChange={(description) => setDiagramConfig(prev => ({ ...prev, description }))}
                                                        onStyleChange={(style) => setDiagramConfig(prev => ({ ...prev, style: style as any }))}
                                                        onAnnotationsChange={(annotations) => setDiagramConfig(prev => ({ ...prev, annotations }))}
                                                        onUnitsChange={(units) => setDiagramConfig(prev => ({ ...prev, units: units as any }))}
                                                        showUnits={diagramConfig.category === "cad" || diagramConfig.category === "architecture"}
                                                    />

                                                    <div className="mt-4">
                                                        <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-3 text-white font-semibold" disabled={engineeringDiagram.generating || !diagramConfig.description} onClick={() => engineeringDiagram.generateDiagram(diagramConfig)}>
                                                            {engineeringDiagram.generating ? "Generating diagram..." : "Generate Diagram (3 credits)"}
                                                        </button>
                                                    </div>

                                                    {engineeringDiagram.diagramUrl && (
                                                        <div className="mt-6 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                                                                                                        <div className="relative w-full h-64">
                                                                                                                            <Image src={engineeringDiagram.diagramUrl} alt="Generated diagram" fill className="rounded-lg bg-white p-4 object-contain" unoptimized />
                                                                                                                        </div>
                                                            <div className="flex gap-2 mt-4">
                                                                <button className="btn">Download PNG</button>
                                                                <button className="btn">Download SVG</button>
                                                                <button className="btn">Download PDF</button>
                                                                <button className="btn">Download DXF</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {engineeringDiagram.error && (
                                                        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">{engineeringDiagram.error}</div>
                                                    )}
                                                </div>
                                                )}
                        <div className={cn("space-y-3", FORM_SECTION_CLASS)} data-tour-id="prompt">
                            <label
                                htmlFor="prompts"
                                className="inline-block text-sm font-semibold text-gray-800 dark:text-neutral-100"
                            >
                                {t("formPromptsLabel")}
                            </label>

                            <textarea
                                id="prompts"
                                className="block w-full resize-none rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[176px]"
                                rows={6}
                                placeholder={t("formPromptsPlaceholer")}
                                value={textPrompts}
                                onInput={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                    setTextPrompts(event.target.value)
                                }
                            ></textarea>
                        </div>

                        {/* form section */}
                        {isControlEnabled(generationMode, "aspectRatio") && (
                        <div className={cn("space-y-3", FORM_SECTION_CLASS)}>
                            <label
                                htmlFor="prompts"
                                className="inline-block text-sm font-semibold text-gray-800 dark:text-neutral-100"
                            >
                                {t("formRatioLabel")}
                            </label>

                            <div className="grid gap-2 sm:grid-cols-5">
                                {aspectRatio.map((item, idx) => (
                                    <div key={item.id}>
                                        <label
                                            htmlFor={`hs-radio-in-form-${idx}`}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/80 transition",
                                                item.checked ? "border-primary/60 bg-primary/15 text-primary-100" : "hover:border-primary/30 hover:bg-black/55"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name={`hs-radio-in-form`}
                                                className="shrink-0 border-white/40 text-primary focus:ring-primary/40"
                                                id={`hs-radio-in-form-${idx}`}
                                                checked={item.checked}
                                                disabled={item.disabled}
                                                onChange={(event) => {
                                                    const updated = aspectRatio.map((option) => ({
                                                        ...option,
                                                        checked: option.id === item.id ? event.target.checked : false,
                                                    }));
                                                    setAspectRatio(updated);
                                                }}
                                            />
                                            <span className="pl-1 text-sm font-medium">
                                                {item.label}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* form section */}
                        {isControlEnabled(generationMode, "model") && (
                        <div className={cn("space-y-3", FORM_SECTION_CLASS)}>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="ai-model-selector"
                                    className="inline-block text-sm font-semibold text-gray-800 dark:text-neutral-100"
                                >
                                    {t("formModelsLabel")}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setSettingsOpen(true)}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-neutral-300 dark:hover:text-neutral-100 py-1 px-2 rounded-md border border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800"
                                    aria-label="Open advanced model settings"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Advanced</span>
                                </button>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-5">
                                <select
                                    id="ai-model-selector"
                                    className="block w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    value={selectedModelId}
                                    aria-label="Select AI model for image generation"
                                    title="Choose an AI model"
                                    onChange={(event) =>
                                        setSelectedModelId(event.target.value)
                                    }
                                    disabled={
                                        loadingModels || enabledModels.length === 0
                                    }
                                >
                                    {enabledModels.length === 0 ? (
                                        <option value="" disabled>
                                            {loadingModels
                                                ? "Loading models…"
                                                : "No models available"}
                                        </option>
                                    ) : null}
                                    {enabledModels.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {loadingModels ? (
                                <div className="mt-2">
                                    <SkeletonLoader lines={2} />
                                </div>
                            ) : null}
                            {!loadingModels && enabledModels.length === 0 ? (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    No enabled models found. Add one via advanced settings.
                                </p>
                            ) : null}
                        </div>
                        )}

                        {/* form section */}
                        <div className={cn("space-y-3", FORM_SECTION_CLASS)}>
                            <label
                                htmlFor="prompts"
                                className="inline-block text-sm font-semibold text-gray-800 dark:text-neutral-100"
                            >
                                {t("formPublicLabel")}
                            </label>

                            <div className="grid gap-2 sm:grid-cols-5">
                                <input
                                    type="checkbox"
                                    id="hs-basic-usage"
                                    className="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-600 before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-neutral-400 dark:checked:before:bg-blue-200"
                                    checked={isPublic}
                                    onChange={(event) => {
                                        setIsPublic(event.target.checked);
                                    }}
                                />
                                <label
                                    htmlFor="hs-basic-usage"
                                    className="sr-only"
                                >
                                    switch
                                </label>
                            </div>
                        </div>

                        {/* Storage Switcher Section */}
                        <div className={cn("space-y-3", FORM_SECTION_CLASS)}>
                            <div className="flex items-center justify-between">
                                <StorageSwitcher />
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="w-full lg:w-1/2">
                                    <label htmlFor="preset-select" className="text-xs font-medium text-white/70">Presets</label>
                                    <div className="mt-2 flex gap-2">
                                        <select
                                            id="preset-select"
                                            value={selectedPresetId}
                                            onChange={(event) => handlePresetSelect(event.target.value)}
                                            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                                        >
                                            <option value="">Choose preset…</option>
                                            {presets.map((preset) => (
                                                <option key={preset.id} value={preset.id}>
                                                    {preset.name}{preset.builtIn ? " • Default" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleDeletePresetClick}
                                            className="inline-flex items-center rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 focus-visible:shadow-focus-ring disabled:opacity-40"
                                            disabled={!selectedPresetId || selectedPresetIsBuiltIn}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2">
                                    <label htmlFor="preset-name" className="text-xs font-medium text-white/70">Save or rename preset</label>
                                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                        <input
                                            id="preset-name"
                                            value={presetName}
                                            onChange={(event) => setPresetName(event.target.value)}
                                            placeholder="Name this preset"
                                            className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSavePreset}
                                                className="inline-flex items-center rounded-lg border border-primary/30 bg-primary/20 px-3 py-2 text-sm font-semibold text-primary-200 transition hover:bg-primary/30 focus-visible:shadow-focus-ring disabled:opacity-40"
                                                disabled={!presetName.trim() || !textPrompts.trim()}
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRenamePreset}
                                                className="inline-flex items-center rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 focus-visible:shadow-focus-ring disabled:opacity-40"
                                                disabled={!presetName.trim() || !selectedPresetId || selectedPresetIsBuiltIn}
                                            >
                                                Rename
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-white/50">Presets stay in this browser for now. See DEV_README for backend sync TODO.</p>
                        </div>

                        {/* Compact more options row */}
                        <div className="mt-6 flex items-center justify-between" data-tour-id="controls">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowMore((s) => !s)}
                                    className="inline-flex items-center gap-2 py-1.5 px-3 rounded-md text-sm bg-white border border-gray-200 text-gray-700 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"
                                >
                                    <List className="w-4 h-4" />
                                    {showMore ? "Hide options" : "Add more"}
                                </button>
                                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                                    <input type="checkbox" checked={isProMode} onChange={(e) => setIsProMode(e.target.checked)} className="rounded" />
                                    Pro
                                </label>
                            </div>
                            <div className="text-xs text-gray-400">Keep UI minimal — expand for more controls</div>
                        </div>

                        {showMore ? (
                            <div className="mt-4 space-y-3 rounded-2xl border border-white/12 bg-white/6 p-5 shadow-[0_12px_32px_rgba(6,11,25,0.18)] backdrop-blur">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Category</label>
                                        <select title="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">Any</option>
                                            <option value="illustration">Illustration</option>
                                            <option value="photography">Photography</option>
                                            <option value="concept">Concept Art</option>
                                            <option value="branding">Branding</option>
                                            <option value="uiux">UI / UX</option>
                                            <option value="product">Product Design</option>
                                            <option value="fashion">Fashion Design</option>
                                            <option value="motion">Motion Graphics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Topic</label>
                                        <input title="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. neon city, product shot" className="mt-1 block w-full rounded-md border-gray-200 px-3 py-2 dark:bg-neutral-900 dark:border-neutral-700" />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Use case</label>
                                        <select title="Use case" value={useCase} onChange={(e) => setUseCase(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">Any</option>
                                            <option value="ad">Advertising</option>
                                            <option value="hero">Hero Image</option>
                                            <option value="thumbnail">Thumbnail</option>
                                            <option value="social">Social Post</option>
                                            <option value="pitch-deck">Pitch Deck Slide</option>
                                            <option value="product-shot">Product Shot</option>
                                            <option value="storyboard">Storyboard Frame</option>
                                            <option value="poster">Print Poster</option>
                                            <option value="ui-kit">UI Kit Panel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Industry</label>
                                        <select title="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">Any</option>
                                            <option value="technology">Technology</option>
                                            <option value="consulting">Consulting</option>
                                            <option value="finance">Finance & Fintech</option>
                                            <option value="hardware">Hardware & Devices</option>
                                            <option value="education">Education</option>
                                            <option value="gaming">Gaming & Esports</option>
                                            <option value="automotive">Automotive & Mobility</option>
                                            <option value="architecture">Architecture & Real Estate</option>
                                            <option value="fashion">Fashion & Lifestyle</option>
                                            <option value="health">Health & Wellness</option>
                                            <option value="food">Food & Beverage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Audience</label>
                                        <select title="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">Any</option>
                                            <option value="consumer">Consumer</option>
                                            <option value="b2b">B2B</option>
                                            <option value="kids">Kids</option>
                                            <option value="enterprise">Enterprise</option>
                                            <option value="creative-pros">Creative Pros</option>
                                            <option value="designers">Designers</option>
                                            <option value="developers">Developers</option>
                                            <option value="students">Students</option>
                                            <option value="families">Families</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Format</label>
                                        <select title="Format" value={format} onChange={(e) => setFormat(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option>PNG</option>
                                            <option>JPEG</option>
                                            <option>WEBP</option>
                                            <option>PDF</option>
                                            <option>PSD</option>
                                            <option>SVG</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Look & Feel</label>
                                        <select title="Look and feel" value={look} onChange={(e) => setLook(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200 dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">Any</option>
                                            <option value="photoreal">Photoreal</option>
                                            <option value="cinematic">Cinematic</option>
                                            <option value="minimal">Minimal</option>
                                            <option value="painterly">Painterly</option>
                                            <option value="retro">Retro Futurism</option>
                                            <option value="sketch">Sketch / Line Art</option>
                                            <option value="noir">Noir</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Size / Resolution</label>
                                        <select title="Size and resolution" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/60 py-2 px-2 shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
                                            <option>512×512</option>
                                            <option>768×768</option>
                                            <option>1024×1024</option>
                                            <option>1344×768</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Quality / Res</label>
                                        <select title="Quality and resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/60 py-2 px-2 shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="sd">SD</option>
                                            <option value="hd">HD</option>
                                            <option value="4k" disabled={!isProMode} className={!isProMode ? 'text-gray-400' : ''}>4K { !isProMode ? ' (Pro)' : '' }</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Color Space</label>
                                        <select title="Color space" value={colorSpace} onChange={(e) => setColorSpace(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/60 py-2 px-2 shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
                                            <option>sRGB</option>
                                            <option>Adobe RGB</option>
                                            <option>Display P3</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-neutral-300">Filter / Effect</label>
                                        <select title="Filter or effect" value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/60 py-2 px-2 shadow-sm dark:bg-neutral-900 dark:border-neutral-700">
                                            <option value="">None</option>
                                            <option value="vintage">Vintage</option>
                                            <option value="cinematic">Cinematic</option>
                                            <option value="mono">Monochrome</option>
                                            <option value="chromatic">Chromatic Bloom</option>
                                            <option value="clean">Clean Studio</option>
                                            <option value="gloss">High Gloss</option>
                                            <option value="grain">Granular Film</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Variation controls */}
                                {isControlEnabled(generationMode, "variations") && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="variation-count" className="text-xs font-semibold uppercase tracking-wide text-white/80">Variations</label>
                                            <span className="text-[11px] text-white/50">{variationCount}x</span>
                                        </div>
                                        <input
                                            id="variation-count"
                                            type="range"
                                            min={1}
                                            max={4}
                                            step={1}
                                            value={variationCount}
                                            onChange={(event) => setVariationCount(Number(event.target.value))}
                                            className="mt-3 w-full accent-primary"
                                            aria-label="Number of variations"
                                        />
                                        <p className="mt-2 text-[11px] text-white/50">More variations may increase render time.</p>
                                    </div>
                                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="variation-strength" className="text-xs font-semibold uppercase tracking-wide text-white/80">Variation intensity</label>
                                            <span className="text-[11px] text-white/50">{variationStrength}%</span>
                                        </div>
                                        <input
                                            id="variation-strength"
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={variationStrength}
                                            onChange={(event) => setVariationStrength(Number(event.target.value))}
                                            className="mt-3 w-full accent-primary"
                                            aria-label="Variation intensity"
                                        />
                                        <p className="mt-2 text-[11px] text-white/50">0% keeps outputs close; 100% explores bold differences.</p>
                                    </div>
                                </div>
                                )}

                                {/* Synthetic assets */}
                                {isControlEnabled(generationMode, "syntheticAsset") && (
                                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white">Synthetic assets</h3>
                                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-200">Beta</span>
                                    </div>
                                    <p className="mt-1 text-xs text-white/60">Provide structured context to recreate people, places, objects, or memories with higher fidelity.</p>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="synthetic-asset-type" className="text-xs font-medium text-white/70">Asset type</label>
                                            <select
                                                id="synthetic-asset-type"
                                                value={syntheticAsset.assetType}
                                                onChange={(event) => updateSyntheticAsset("assetType", event.target.value as SyntheticAssetPreset["assetType"])}
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                                            >
                                                <option value="person">Person</option>
                                                <option value="place">Place</option>
                                                <option value="object">Object</option>
                                                <option value="memory">Memory</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="synthetic-asset-name" className="text-xs font-medium text-white/70">Name or subject</label>
                                            <input
                                                id="synthetic-asset-name"
                                                value={syntheticAsset.displayName}
                                                onChange={(event) => updateSyntheticAsset("displayName", event.target.value)}
                                                placeholder="e.g. Riley Navarro"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <label htmlFor="synthetic-asset-era" className="text-xs font-medium text-white/70">Era / timeframe</label>
                                            <input
                                                id="synthetic-asset-era"
                                                value={syntheticAsset.era}
                                                onChange={(event) => updateSyntheticAsset("era", event.target.value)}
                                                placeholder="2098 dusk"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="synthetic-asset-location" className="text-xs font-medium text-white/70">Location</label>
                                            <input
                                                id="synthetic-asset-location"
                                                value={syntheticAsset.location}
                                                onChange={(event) => updateSyntheticAsset("location", event.target.value)}
                                                placeholder="Neo-Tokyo skyrail"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="synthetic-asset-mood" className="text-xs font-medium text-white/70">Mood</label>
                                            <input
                                                id="synthetic-asset-mood"
                                                value={syntheticAsset.mood}
                                                onChange={(event) => updateSyntheticAsset("mood", event.target.value)}
                                                placeholder="Optimistic focus"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="synthetic-asset-lighting" className="text-xs font-medium text-white/70">Lighting</label>
                                            <input
                                                id="synthetic-asset-lighting"
                                                value={syntheticAsset.lighting}
                                                onChange={(event) => updateSyntheticAsset("lighting", event.target.value)}
                                                placeholder="Pastel neon rim lighting"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="synthetic-asset-attire" className="text-xs font-medium text-white/70">Wardrobe / materials</label>
                                            <input
                                                id="synthetic-asset-attire"
                                                value={syntheticAsset.attire}
                                                onChange={(event) => updateSyntheticAsset("attire", event.target.value)}
                                                placeholder="Translucent cobalt techwear"
                                                className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor="synthetic-asset-backstory" className="text-xs font-medium text-white/70">Narrative backstory</label>
                                        <textarea
                                            id="synthetic-asset-backstory"
                                            value={syntheticAsset.backstory}
                                            onChange={(event) => updateSyntheticAsset("backstory", event.target.value)}
                                            rows={3}
                                            placeholder="Flux architect guiding autonomous agents through a digital metropolis"
                                            className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                        />
                                    </div>
                                    <div className="mt-3">
                                        <label htmlFor="synthetic-asset-notes" className="text-xs font-medium text-white/70">Additional metadata</label>
                                        <textarea
                                            id="synthetic-asset-notes"
                                            value={syntheticAsset.metadataNotes}
                                            onChange={(event) => updateSyntheticAsset("metadataNotes", event.target.value)}
                                            rows={2}
                                            placeholder="Safety requirements, camera, lenses, or cultural notes"
                                            className="mt-2 block w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                                        />
                                    </div>
                                </div>
                                )}

                                {isProMode ? (
                                    <div className="mt-3 text-xs text-neutral-500">Pro options: higher quality, additional styles and export formats are available when Pro is enabled.</div>
                                ) : (
                                    <div className="mt-3 text-xs text-neutral-500">Quick mode: upgrade to Pro to unlock 4K exports and advanced filters.</div>
                                )}
                            </div>
                        ) : null}

                        <div className="mt-12 space-y-4" data-tour-id="generate">
                            <button
                                type="button"
                                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary px-5 py-3 text-base font-semibold text-midnight-950 shadow-[0_12px_30px_rgba(123,215,255,0.35)] transition hover:bg-primary-200 focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale"
                                disabled={generating || !hasAcceptedTos}
                                onClick={handleGenerative}
                            >
                                {generating ? (
                                    <span
                                        className="inline-block size-4 animate-spin rounded-full border-[3px] border-midnight-950/30 border-t-midnight-950"
                                        role="status"
                                        aria-label="Generating"
                                    ></span>
                                ) : (
                                    <SquareMousePointer className="h-5 w-5" />
                                )}
                                <span>{generating ? "Generating" : "Generate Content"}</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-midnight-950/20 px-3 py-1 text-xs font-semibold text-midnight-950/80">
                                    <Icons.CreditsIcon />1
                                </span>
                            </button>

                            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                                <input
                                    id="tos-acknowledgement"
                                    type="checkbox"
                                    checked={hasAcceptedTos}
                                    onChange={(event) => setHasAcceptedTos(event.target.checked)}
                                    className="mt-1 size-4 rounded border-white/25 bg-black/40 text-primary focus-visible:shadow-focus-ring"
                                />
                                <label htmlFor="tos-acknowledgement" className="space-y-1">
                                    <span className="block text-sm font-semibold text-white">Usage & privacy</span>
                                    <span className="block text-xs leading-relaxed text-white/70">
                                        Prompts and generated images may be stored securely to improve Autogen and Azure Flux quality. By generating you confirm you have rights to the input, accept no warranty, and assume responsibility for downstream usage. Review our
                                        {" "}
                                        <a href="/privacy-policy" className="text-primary-200 underline-offset-2 hover:underline">privacy policy</a>
                                        {" "}and
                                        {" "}
                                        <a href="/terms-of-service" className="text-primary-200 underline-offset-2 hover:underline">terms of service</a>
                                        .
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`mt-5 sm:mt-10 lg:mt-0 lg:col-span-5 ${styles.dynamicContainer}`}
                        ref={(el) => {
                            if (el) {
                                el.style.setProperty('--element-height', `${elementHeight}px`);
                            }
                        }}
                    >
                        <div className="space-y-2 flex flex-col h-full overflow-hidden">
                            <label
                                htmlFor="prompts"
                                className="inline-block text-sm font-medium text-gray-800 mt-2.5 dark:text-neutral-200"
                            >
                                {t("formResultLabel")}
                            </label>

                            <div className="relative flex w-full min-h-[22rem] flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-midnight-950/60 p-4 text-white shadow-[0_18px_48px_rgba(3,0,12,0.55)]" data-tour-id="gallery">
                                {displaySkeleton ? (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
                                        <div className="w-full max-w-[460px] rounded-xl border border-primary/25 bg-black/70 p-4 font-mono text-sm text-primary-200">
                                            {timeline.map((step) => (
                                                <div key={step.status} className="flex items-center gap-2 py-1">
                                                    <span>{step.reached ? "✔" : "▹"}</span>
                                                    <span>{step.label}</span>
                                                </div>
                                            ))}
                                            <div className="mt-3 text-xs text-white/70">
                                                {variationCount > 1
                                                    ? `Preparing ${variationCount} variations • variance ${variationStrength}%`
                                                    : "Preparing single variation"}
                                            </div>
                                        </div>
                                        <SkeletonLoader lines={4} />
                                    </div>
                                ) : hasGenerations && activeGeneration ? (
                                    <>
                                        <ControlledZoom
                                            isZoomed={isZoomed}
                                            onZoomChange={handleZoomChange}
                                        >
                                            <Image
                                                src={activeGeneration.url}
                                                alt={activeGeneration.prompt || "Generated AI image"}
                                                width={1024}
                                                height={1024}
                                                sizes="(max-width: 768px) 100vw, 480px"
                                                placeholder="blur"
                                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NcufL/PwAHVgOwjXBlLQAAAABJRU5ErkJggg=="
                                                className={`max-h-[520px] w-full rounded-xl object-contain ${styles.constrainedImg}`}
                                                onLoadingComplete={() => setImageLoading(false)}
                                            />
                                        </ControlledZoom>
                                        <div className="absolute bottom-4 left-4 flex max-w-[340px] flex-col gap-1 rounded-xl border border-white/12 bg-black/55 px-4 py-3 text-xs text-white/70 backdrop-blur">
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary-200">
                                                {STATUS_COPY[activeGeneration.status]?.label ?? "Ready"}
                                            </span>
                                            <span className="line-clamp-3 text-balance text-xs text-white/65">
                                                {activeGeneration.prompt ?? textPrompts}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <div className="gen-image-toolbars flex">
                                                <ImageToolbar
                                                    imgUrl={activeGeneration.url}
                                                    handleDownload={(onDownloaded: () => void) => handleDownload(activeGeneration.url, onDownloaded)}
                                                    handleShare={(platform: string, url?: string) => handleShare(platform, url ?? activeGeneration.url)}
                                                    handleMaximize={handleMaximize}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2 text-center text-white/60">
                                                <ImageIcon className="h-10 w-10 text-white/40" />
                                                <p className="max-w-md text-sm leading-relaxed text-balance hyphenate">
                                                    Your Flux creations will appear here. Try one of the quick prompts below to see the retro-cyber aesthetic in action.
                                                </p>
                                                <div className="flex flex-wrap justify-center gap-3">
                                                    {samplePrompts.map((prompt) => (
                                                        <button
                                                            key={prompt}
                                                            type="button"
                                                            onClick={() => applySamplePrompt(prompt)}
                                                            className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary-100 transition hover:bg-primary/25 focus-visible:shadow-focus-ring"
                                                        >
                                                            <SquareMousePointer className="h-4 w-4" />
                                                            {prompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                )}
                            </div>

                            {thumbnails.length > 1 ? (
                                <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                                    {thumbnails.map((thumb) => (
                                        <button
                                            type="button"
                                            key={thumb.id ?? `${thumb.url}-${thumb.localIndex}`}
                                            onClick={() => setActiveGenerationIndex(thumb.localIndex)}
                                            className={cn(
                                                "group relative overflow-hidden rounded-xl border bg-white/5 p-1 transition focus-visible:shadow-focus-ring",
                                                activeGeneration?.url === thumb.url
                                                    ? "border-primary/60"
                                                    : "border-white/10 hover:border-primary/30"
                                            )}
                                        >
                                            <span className="block overflow-hidden rounded-lg">
                                                <Image
                                                    src={thumb.url}
                                                    alt={thumb.prompt || "Generated variation"}
                                                    width={360}
                                                    height={360}
                                                    sizes="(max-width: 768px) 33vw, 180px"
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                                    placeholder="blur"
                                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQI12P4z8DwHwAE/wL+Ysr11QAAAABJRU5ErkJggg=="
                                                />
                                            </span>
                                            <span className="mt-2 block text-[11px] font-semibold uppercase tracking-wide text-white/50">
                                                {STATUS_COPY[thumb.status]?.label ?? "Ready"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                                {timeline.map((step) => (
                                    <span
                                        key={step.status}
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-full px-3 py-1",
                                            step.reached ? "bg-primary/20 text-primary-200" : "bg-white/5 text-white/50"
                                        )}
                                        title={step.helper}
                                    >
                                        {step.reached ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Clock className="h-4 w-4" />
                                        )}
                                        <span>{step.label}</span>
                                    </span>
                                ))}
                                {hasFailure ? (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-red-200">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="max-w-[220px] text-left">{failureMessage}</span>
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            className="inline-flex items-center gap-1 rounded-full border border-red-200/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-100 hover:bg-red-500/10 focus-visible:shadow-focus-ring"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            Retry
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications of */}
                <ApplicationsOf />
            </div>

            <LoginDialog open={openLogin} setOpen={setOpenLogin}>
                <div></div>
            </LoginDialog>
            <ModelSettingsDialog
                 open={settingsOpen}
                 onOpenChange={setSettingsOpen}
                 models={models}
                 loading={loadingModels}
                 onRefresh={refreshModels}
                 onSelectModel={setSelectedModelId}
                 currentModelId={selectedModelId}
                // Provide optional UI state previews to settings dialog
                // (non-functional, used for display and future hooks)
                // @ts-ignore
                proMode={isProMode}
             />
            <GuidedTour />
        </>
    );
};

export default ImageGenerator;
