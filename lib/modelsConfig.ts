import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export type ModelProvider = "azure";

export interface ModelConfig {
    id: string;
    label: string;
    provider: ModelProvider;
    endpoint: string;
    apiKey: string;
    quality?: string;
    enabled: boolean;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ModelsFileShape {
    models: ModelConfig[];
}

const MODELS_DIR = path.join(process.cwd(), "config");
const MODELS_FILE = path.join(MODELS_DIR, "models.json");
const MODELS_EXAMPLE_FILE = path.join(MODELS_DIR, "models.example.json");

async function resolvePlaceholder(value: string): Promise<string> {
    if (!value) {
        return value;
    }

    const envMatch = value.match(/^\$\{(.+)}$/);
    if (envMatch) {
        const envValue = process.env[envMatch[1]];
        return envValue ?? "";
    }

    return value;
}

async function parseModels(raw: string): Promise<ModelConfig[]> {
    const data = JSON.parse(raw) as Partial<ModelsFileShape>;
    const models = Array.isArray(data.models) ? data.models : [];

    // Resolve any environment placeholders before returning
    const resolvedModels: ModelConfig[] = [];
    for (const model of models) {
        const endpoint = await resolvePlaceholder(model.endpoint);
        const apiKey = await resolvePlaceholder(model.apiKey);
        resolvedModels.push({
            ...model,
            endpoint,
            apiKey,
        });
    }

    return resolvedModels;
}

async function ensureModelsFile(): Promise<void> {
    try {
        await fs.access(MODELS_FILE);
    } catch {
        await fs.mkdir(MODELS_DIR, { recursive: true });
        try {
            const exampleExists = await fs
                .access(MODELS_EXAMPLE_FILE)
                .then(() => true)
                .catch(() => false);

            if (exampleExists) {
                const exampleContent = await fs.readFile(
                    MODELS_EXAMPLE_FILE,
                    "utf-8"
                );
                await fs.writeFile(MODELS_FILE, exampleContent, "utf-8");
            } else {
                const initial: ModelsFileShape = { models: [] };
                await fs.writeFile(
                    MODELS_FILE,
                    JSON.stringify(initial, null, 2),
                    "utf-8"
                );
            }
        } catch (error) {
            console.error("Failed to scaffold models config file:", error);
            throw error;
        }
    }
}

export async function loadModelsConfig(): Promise<ModelConfig[]> {
    await ensureModelsFile();
    const raw = await fs.readFile(MODELS_FILE, "utf-8");
    return await parseModels(raw);
}

async function loadModelsFile(): Promise<ModelsFileShape> {
    await ensureModelsFile();
    const raw = await fs.readFile(MODELS_FILE, "utf-8");
    return JSON.parse(raw) as ModelsFileShape;
}

export async function saveModelsConfig(models: ModelConfig[]): Promise<void> {
    const payload: ModelsFileShape = {
        models: models.map((model) => ({
            ...model,
            updatedAt: new Date().toISOString(),
        })),
    };

    await fs.writeFile(
        MODELS_FILE,
        JSON.stringify(payload, null, 2),
        "utf-8"
    );
}

export async function getModelById(id: string): Promise<ModelConfig | null> {
    const models = await loadModelsConfig();
    return models.find((model) => model.id === id) ?? null;
}

export function maskApiKey(apiKey: string): string {
    if (!apiKey) return "";
    if (apiKey.length <= 6) {
        return "*".repeat(apiKey.length);
    }
    return `${apiKey.slice(0, 3)}****${apiKey.slice(-3)}`;
}

export type CreateModelPayload = Omit<
    ModelConfig,
    "id" | "createdAt" | "updatedAt"
> & { id?: string };

export async function createModelConfig(
    payload: CreateModelPayload
): Promise<ModelConfig> {
    const modelsFile = await loadModelsFile();
    const nowIso = new Date().toISOString();
    const { id: providedId, ...rest } = payload;
    const model: ModelConfig = {
        ...rest,
        id: providedId || nanoid(12),
        createdAt: nowIso,
        updatedAt: nowIso,
    };

    const models = modelsFile.models ?? [];
    const exists = models.some((item) => item.id === model.id);
    if (exists) {
        throw new Error(`Model with id '${model.id}' already exists`);
    }

    models.push(model);
    await saveModelsConfig(models);
    return model;
}

export async function updateModelConfig(
    id: string,
    updates: Partial<Omit<ModelConfig, "id" | "createdAt">>
): Promise<ModelConfig> {
    const modelsFile = await loadModelsFile();
    const models = modelsFile.models ?? [];
    const index = models.findIndex((model) => model.id === id);

    if (index === -1) {
        throw new Error("Model not found");
    }

    const existing = models[index];
    const updated: ModelConfig = {
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
    };

    models[index] = updated;
    await saveModelsConfig(models);
    return updated;
}

export async function deleteModelConfig(id: string): Promise<void> {
    const modelsFile = await loadModelsFile();
    const models = modelsFile.models ?? [];
    const filtered = models.filter((model) => model.id !== id);
    if (filtered.length === models.length) {
        throw new Error("Model not found");
    }
    await saveModelsConfig(filtered);
}

export function sanitizeModelForClient(model: ModelConfig) {
    return {
        ...model,
        apiKey: maskApiKey(model.apiKey),
    };
}

export async function getEnabledModels(): Promise<ModelConfig[]> {
    const models = await loadModelsConfig();
    return models.filter((model) => model.enabled);
}
