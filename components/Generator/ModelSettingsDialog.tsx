"use client";

import { FormEvent, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
    Check,
    Loader2,
    Plus,
    ToggleLeft,
    ToggleRight,
    Trash,
    X,
} from "lucide-react";
import type { GeneratorModelOption } from "./types";

interface ModelSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    models: GeneratorModelOption[];
    loading: boolean;
    onRefresh: () => Promise<void>;
    onSelectModel: (modelId: string) => void;
    currentModelId: string;
}

interface ModelFormState {
    label: string;
    endpoint: string;
    apiKey: string;
    quality: string;
    description: string;
}

const INITIAL_FORM_STATE: ModelFormState = {
    label: "",
    endpoint: "",
    apiKey: "",
    quality: "hd",
    description: "",
};

const ModelSettingsDialog = ({
    open,
    onOpenChange,
    models,
    loading,
    onRefresh,
    onSelectModel,
    currentModelId,
}: ModelSettingsDialogProps) => {
    const [formState, setFormState] = useState<ModelFormState>(
        INITIAL_FORM_STATE
    );
    const [creating, setCreating] = useState(false);
    const [busyModelId, setBusyModelId] = useState<string | null>(null);

    const enabledCount = useMemo(
        () => models.filter((model) => model.enabled).length,
        [models]
    );

    const resetForm = () => setFormState(INITIAL_FORM_STATE);

    const handleInputChange = (
        field: keyof ModelFormState,
        value: string
    ) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateModel = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (creating) return;

        const trimmedLabel = formState.label.trim();
        const trimmedEndpoint = formState.endpoint.trim();
        const trimmedApiKey = formState.apiKey.trim();

        if (!trimmedLabel || !trimmedEndpoint || !trimmedApiKey) {
            toast.error("Label, endpoint, and API key are required.");
            return;
        }

        setCreating(true);
        try {
            const response = await fetch("/api/models", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: trimmedLabel,
                    endpoint: trimmedEndpoint,
                    apiKey: trimmedApiKey,
                    quality: formState.quality.trim() || undefined,
                    description: formState.description.trim() || undefined,
                    enabled: true,
                    provider: "azure",
                }),
            });

            const result = await response.json();
            if (!response.ok || !result?.success) {
                throw new Error(result?.error || "Failed to create model");
            }

            toast.success("Model created successfully.");
            resetForm();
            await onRefresh();
            onSelectModel(result.model?.id ?? "");
        } catch (error: any) {
            console.error("Failed to create model", error);
            toast.error(error?.message || "Failed to create model.");
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (model: GeneratorModelOption) => {
        if (busyModelId) return;
        setBusyModelId(model.id);
        const nextEnabled = !model.enabled;
        try {
            const response = await fetch(`/api/models/${model.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: nextEnabled }),
            });
            const result = await response.json();
            if (!response.ok || !result?.success) {
                throw new Error(result?.error || "Failed to update model");
            }
            toast.success(
                nextEnabled
                    ? "Model enabled successfully."
                    : "Model disabled successfully."
            );
            await onRefresh();
            if (nextEnabled) {
                onSelectModel(model.id);
            }
        } catch (error: any) {
            console.error("Failed to toggle model", error);
            toast.error(error?.message || "Failed to update model.");
        } finally {
            setBusyModelId(null);
        }
    };

    const handleDelete = async (model: GeneratorModelOption) => {
        if (busyModelId) return;
        const confirmed = window.confirm(
            `Delete model "${model.label}"? This cannot be undone.`
        );
        if (!confirmed) {
            return;
        }
        setBusyModelId(model.id);
        try {
            const response = await fetch(`/api/models/${model.id}`, {
                method: "DELETE",
            });

            let result: any = null;
            try {
                result = await response.json();
            } catch (parseError) {
                result = null;
            }

            if (!response.ok || (result && result.success === false)) {
                throw new Error(result?.error || "Failed to delete model");
            }

            toast.success("Model deleted successfully.");
            await onRefresh();
        } catch (error: any) {
            console.error("Failed to delete model", error);
            toast.error(error?.message || "Failed to delete model.");
        } finally {
            setBusyModelId(null);
        }
    };

    const handleUseInGenerator = (modelId: string) => {
        onSelectModel(modelId);
        toast.success("Model selected for generator.");
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none dark:bg-neutral-900">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
                                Advanced model settings
                            </Dialog.Title>
                            <Dialog.Description className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                                Manage Azure Flux models available to the generator.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close className="rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100">
                            <X className="h-5 w-5" />
                        </Dialog.Close>
                    </div>

                    <div className="mt-6 space-y-6">
                        <section className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <h3 className="font-medium text-gray-900 dark:text-neutral-100">
                                    Configured models
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-neutral-400">
                                    {enabledCount} enabled
                                </span>
                            </div>
                            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-neutral-400">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading models…
                                    </div>
                                ) : models.length === 0 ? (
                                    <p className="py-4 text-sm text-gray-500 dark:text-neutral-400">
                                        No models configured yet. Use the form below to add your Azure Flux endpoint.
                                    </p>
                                ) : (
                                    models.map((model) => {
                                        const isBusy = busyModelId === model.id;
                                        const isCurrent = currentModelId === model.id;
                                        return (
                                            <div
                                                key={model.id}
                                                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                                                                {model.label}
                                                            </h4>
                                                            {model.enabled ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                                    <Check className="h-3 w-3" />
                                                                    Enabled
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                                                                    Disabled
                                                                </span>
                                                            )}
                                                            {isCurrent ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                                                    In use
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        {model.description ? (
                                                            <p className="text-xs text-gray-500 dark:text-neutral-400">
                                                                {model.description}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    <span className="self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Azure Flux
                                                    </span>
                                                </div>
                                                <dl className="mt-3 grid gap-2 text-xs text-gray-500 dark:text-neutral-400">
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                        <dt className="font-medium">Endpoint</dt>
                                                        <dd className="font-mono text-[11px] sm:max-w-[70%] sm:text-right">
                                                            {model.endpoint || "—"}
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                        <dt className="font-medium">API key</dt>
                                                        <dd className="font-mono text-[11px] sm:max-w-[70%] sm:text-right">
                                                            {model.apiKey || "—"}
                                                        </dd>
                                                    </div>
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                        <dt className="font-medium">Quality</dt>
                                                        <dd>{model.quality || "default"}</dd>
                                                    </div>
                                                </dl>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                                        onClick={() => handleToggle(model)}
                                                        disabled={isBusy}
                                                    >
                                                        {isBusy ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : model.enabled ? (
                                                            <ToggleLeft className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ToggleRight className="h-3.5 w-3.5" />
                                                        )}
                                                        {model.enabled ? "Disable" : "Enable"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-200"
                                                        onClick={() => handleUseInGenerator(model.id)}
                                                        disabled={!model.enabled || isBusy}
                                                    >
                                                        Use in generator
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                                                        onClick={() => handleDelete(model)}
                                                        disabled={isBusy}
                                                    >
                                                        {isBusy ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash className="h-3.5 w-3.5" />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-neutral-100">
                                Add a new Azure model
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                                Paste the endpoint and API key from your Azure AI Foundry deployment. Keys are stored server-side only.
                            </p>
                            <form
                                className="mt-4 space-y-3"
                                onSubmit={handleCreateModel}
                            >
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="model-label"
                                        className="text-xs font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Display name
                                    </label>
                                    <input
                                        id="model-label"
                                        type="text"
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Flux 1.1 [pro]"
                                        value={formState.label}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "label",
                                                event.target.value
                                            )
                                        }
                                        disabled={creating}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="model-endpoint"
                                        className="text-xs font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Azure endpoint URL
                                    </label>
                                    <input
                                        id="model-endpoint"
                                        type="url"
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="https://your-resource.openai.azure.com/openai/deployments/..."
                                        value={formState.endpoint}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "endpoint",
                                                event.target.value
                                            )
                                        }
                                        disabled={creating}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="model-api-key"
                                        className="text-xs font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        API key
                                    </label>
                                    <input
                                        id="model-api-key"
                                        type="password"
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Azure API key"
                                        value={formState.apiKey}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "apiKey",
                                                event.target.value
                                            )
                                        }
                                        disabled={creating}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="model-quality"
                                        className="text-xs font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Quality (optional)
                                    </label>
                                    <input
                                        id="model-quality"
                                        type="text"
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="hd"
                                        value={formState.quality}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "quality",
                                                event.target.value
                                            )
                                        }
                                        disabled={creating}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="model-description"
                                        className="text-xs font-medium text-gray-700 dark:text-neutral-300"
                                    >
                                        Description (optional)
                                    </label>
                                    <textarea
                                        id="model-description"
                                        className="h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder="Extra notes for this deployment"
                                        value={formState.description}
                                        onChange={(event) =>
                                            handleInputChange(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        disabled={creating}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    Add model
                                </button>
                            </form>
                        </section>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ModelSettingsDialog;
