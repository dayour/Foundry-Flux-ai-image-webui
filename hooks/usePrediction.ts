import to from "await-to-js";
import { useState } from "react";
import { toast } from "sonner";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type PredictionStatus = "queued" | "starting" | "processing" | "succeeded" | "failed" | "canceled";

export interface PredictionResponse {
    id?: string;
    dataId?: string;
    status?: PredictionStatus;
    output?: string | string[];
    detail?: string;
    error?: string;
    [key: string]: unknown;
}

export interface GenerationResult {
    id?: string;
    url: string;
    prompt?: string;
    status: PredictionStatus;
}

export interface PredictionRequest {
    prompts: string;
    ratio?: string;
    model: string;
    isPublic?: boolean;
    user?: Record<string, unknown> | null;
    options?: Record<string, unknown>;
}

const normalizePredictionResponse = (payload: unknown): PredictionResponse | null => {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const record = payload as Record<string, unknown>;
    const nested = record.prediction;
    if (nested && typeof nested === "object") {
        return normalizePredictionResponse(nested);
    }

    return record as PredictionResponse;
};

const extractImageUrl = (value: PredictionResponse): string | null => {
    const { output } = value;
    if (typeof output === "string") {
        return output;
    }
    if (Array.isArray(output)) {
        const first = output.find((item): item is string => typeof item === "string");
        return first ?? null;
    }
    return null;
};

const extractAllImageUrls = (value: PredictionResponse): string[] => {
    const { output } = value;
    if (typeof output === "string") {
        // Support comma-separated URLs for backward compatibility
        return output.split(",").map((url) => url.trim()).filter(Boolean);
    }
    if (Array.isArray(output)) {
        return output.filter((item): item is string => typeof item === "string");
    }
    return [];
};

const parseErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return fallback;
};

export function usePrediction() {
    const [generations, setGenerations] = useState<GenerationResult[]>([]);
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [generatedList, setGeneratedList] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [statusTrail, setStatusTrail] = useState<PredictionStatus[]>([]);

    const resetState = () => {
        setPrediction(null);
        setGenerations([]);
        setGeneratedList([]);
        setError(null);
        setStatusTrail([]);
    };

    const pushStatus = (status?: PredictionStatus) => {
        if (!status) {
            return;
        }
        setStatusTrail((prev) => {
            if (prev[prev.length - 1] === status) {
                return prev;
            }
            return [...prev, status];
        });
    };

    const handleSubmit = async (params: PredictionRequest) => {
        resetState();
        const [rawError, response] = await to<Response>(
            fetch("/api/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            })
        );

        if (rawError || !response) {
            const message = parseErrorMessage(rawError, "Failed to submit prediction request");
            console.error("Prediction submission error", rawError);
            toast.error(message);
            return Promise.reject(new Error(message));
        }

        const payload = normalizePredictionResponse(await response.json());

        if (!payload) {
            const message = "Invalid prediction response";
            toast.error(message);
            return Promise.reject(new Error(message));
        }

        const responseId = payload.dataId ?? payload.id ?? undefined;

        if (response.status !== 201) {
            const detail = payload.detail ?? payload.error ?? "Failed to generate image";
            toast.error(detail);
            setError(detail);
            return Promise.reject(new Error(detail));
        }

        setPrediction(payload);
        pushStatus(payload.status);

        const initialUrl = extractImageUrl(payload);
        if (payload.status === "succeeded" && initialUrl) {
            const urls = extractAllImageUrls(payload);

            const nextGenerations = urls.map((url, index) => ({
                id: `${payload.id ?? "prediction"}-${index}`,
                url,
                prompt: params.prompts,
                status: "succeeded" as PredictionStatus,
            }));
            setGenerations(nextGenerations);
            return initialUrl;
        }

        let current = payload;
        while (current.status !== "succeeded" && current.status !== "failed") {
            if (!current.id) {
                break;
            }

            await sleep(5000);
            const statusResponse = await fetch(
                `/api/predictions/${current.id}?pid=${responseId ?? ""}`,
                { cache: "no-store" }
            );
            const statusPayload = normalizePredictionResponse(await statusResponse.json());

            if (!statusPayload) {
                const message = "Invalid prediction status response";
                toast.error(message);
                setError(message);
                return Promise.reject(new Error(message));
            }

            if (statusResponse.status !== 200) {
                const detail = statusPayload.detail ?? statusPayload.error ?? "Failed to fetch prediction status";
                toast.error(detail);
                setError(detail);
                return Promise.reject(new Error(detail));
            }

            pushStatus(statusPayload.status);
            const imageUrl = extractImageUrl(statusPayload);
            if (imageUrl) {
                const urls = extractAllImageUrls(statusPayload);

                const resolved = urls.map((url, index) => ({
                    id: `${statusPayload.id ?? "prediction"}-${index}`,
                    url,
                    prompt: params.prompts,
                    status: statusPayload.status ?? "succeeded",
                }));
                setGenerations(resolved);
                return imageUrl;
            }

            current = statusPayload;
            setPrediction(statusPayload);
        }

        if (current.status === "failed") {
            setError(current.error ?? current.detail ?? "Generation failed");
        }

        return undefined;
    };

    return {
        prediction,
        error,
        generatedList,
        setGeneratedList,
        generations,
        statusTrail,
        handleSubmit,
    };
}
