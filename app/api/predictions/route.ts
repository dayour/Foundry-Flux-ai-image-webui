import { insertGeneration } from "@/models/generation";
import to from "await-to-js";
import { NextResponse } from "next/server";
import { defaultStorageService } from "@/lib/storage";
import { nanoid } from "nanoid";
import { getModelById } from "@/lib/modelsConfig";
import { isUnlimitedAccount, isUnlimitedUserRecord } from "@/lib/unlimitedAccounts";
// import { Client } from "@gradio/client";
// import to from "await-to-js";

// Rate limiting for Azure API calls
const azureRateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

function checkRateLimit(userId: string, skip: boolean): boolean {
    if (skip) {
        return true;
    }

    const now = Date.now();
    const userLimit = azureRateLimiter.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
        azureRateLimiter.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    userLimit.count++;
    return true;
}

// Convert base64 image to buffer and upload to R2
async function uploadBase64Image(
    base64Data: string,
    model: string,
    userId: string
): Promise<string | null> {
    try {
        // Remove data URL prefix if present
        const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64String, "base64");

        // Log image size for monitoring
        const sizeKB = (buffer.length / 1024).toFixed(2);
    console.debug(`Base64 image size: ${sizeKB}KB (model: ${model})`);

        // Validate image size (warn if > 2MB)
        if (buffer.length > 2 * 1024 * 1024) {
            console.warn(`Large image detected: ${sizeKB}KB - consider implementing compression`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueId = nanoid(8);
        const objectKey = `${userId}/${model}-${timestamp}-${uniqueId}.jpg`;

        // Upload using the storage service (supports local and R2)
        const url = await defaultStorageService.uploadFile({
            FileName: "image.jpg",
            fileBuffer: buffer,
            objectKey: objectKey,
        });

        if (url) {
            console.info(`Successfully uploaded image: ${objectKey}`);
        }

        return url;
    } catch (error) {
        console.error("Error uploading base64 image:", error);
        return null;
    }
}

// Check if content was filtered by Azure's safety filters
type AzureContentFilterResult = {
    filtered?: boolean;
    severity?: string;
    detected?: boolean;
};

interface AzureFluxImageData {
    url?: string;
    b64_json?: string;
    content_filter_results?: Record<string, AzureContentFilterResult> & {
        profanity?: { detected?: boolean };
        jailbreak?: { detected?: boolean };
    };
}

interface AzureFluxResponse {
    created?: number;
    data?: AzureFluxImageData[];
}

interface AzureImageGenerationRequest {
    prompt: string;
    n: number;
    size: string;
    quality?: string;
}

interface StoredPrediction {
    id: string;
    status: "succeeded";
    output: string | string[];
    dataId?: string;
}

function checkContentSafety(azureResponse: AzureFluxResponse): { filtered: boolean; reason?: string } {
    const contentFilters = azureResponse.data?.[0]?.content_filter_results;
    
    if (!contentFilters) {
        return { filtered: false };
    }

    const filterCategories = ['sexual', 'violence', 'hate', 'self_harm'];
    for (const category of filterCategories) {
        if (contentFilters[category]?.filtered) {
            return { 
                filtered: true, 
                reason: `Content filtered due to ${category} (severity: ${contentFilters[category].severity})` 
            };
        }
    }

    if (contentFilters.profanity?.detected || contentFilters.jailbreak?.detected) {
        const reasons = [];
        if (contentFilters.profanity?.detected) reasons.push('profanity');
        if (contentFilters.jailbreak?.detected) reasons.push('jailbreak attempt');
        return { 
            filtered: true, 
            reason: `Content filtered due to ${reasons.join(' and ')}` 
        };
    }

    return { filtered: false };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class AzureFluxApiError extends Error {
    constructor(
        message: string,
        public readonly status: number | null,
        public readonly retryable: boolean
    ) {
        super(message);
        this.name = "AzureFluxApiError";
    }
}

const isAzureFluxResponse = (value: unknown): value is AzureFluxResponse => {
    if (!value || typeof value !== "object") {
        return false;
    }
    const candidate = value as { data?: unknown };
    return !candidate.data || Array.isArray(candidate.data);
};

const extractErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return fallback;
};

async function callAzureFluxAPI(
    endpoint: string,
    apiKey: string,
    prompts: string,
    model: string,
    ratio: string,
    quality?: string
) {
    // Convert ratio to dimensions for Azure OpenAI Image API
    // Azure OpenAI uses "size" parameter in format "widthxheight"
    const dimensionMap: Record<string, string> = {
        "1:1": "1024x1024",
        "16:9": "1344x768",
        "9:16": "768x1344",
        "3:2": "1216x832",
        "2:3": "832x1216",
    };

    const size = dimensionMap[ratio] || "1024x1024";

    // Azure OpenAI Image Generation API format
    const requestBody: AzureImageGenerationRequest = {
        prompt: prompts,
        n: 1, // Azure Flux currently supports n=1; we'll generate multiple calls for variations
        size: size,
    };

    // Add model-specific parameters for FLUX models
    // Note: These may need adjustment based on actual Azure API support
    if (quality) {
        requestBody.quality = quality;
    } else if (model === "azure-flux-1.1-pro") {
        // FLUX 1.1 [pro] supports up to 4MP images and has Ultra/Raw modes
        // quality: "hd" for higher quality output
        requestBody.quality = "hd";
    }

    const maxAttempts = 3;
    let attempt = 0;
    let delay = 1000;

    while (attempt < maxAttempts) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const retryable = response.status >= 500 || response.status === 429;
                throw new AzureFluxApiError(
                    `Azure API error (${response.status}): ${errorText}`,
                    response.status,
                    retryable
                );
            }

            const payload = (await response.json()) as unknown;
            if (!isAzureFluxResponse(payload)) {
                throw new AzureFluxApiError("Unexpected Azure Flux response shape", null, false);
            }

            return payload;
        } catch (error) {
            const isRetryable =
                error instanceof AzureFluxApiError
                    ? error.retryable
                    : attempt < maxAttempts - 1;

            if (isRetryable && attempt < maxAttempts - 1) {
                await wait(delay);
                delay *= 2;
                attempt += 1;
                continue;
            }

            const message = extractErrorMessage(error, "Azure Flux API request failed");
            throw new Error(message);
        }
    }

    throw new Error("Azure Flux API request failed after retries");
}

export async function POST(request: Request) {
    const { prompts, ratio, model, isPublic, user, options } = await request.json();

    const userRecord = user && typeof user === "object" ? (user as Record<string, unknown>) : null;
    const userId = typeof userRecord?.id === "string" ? userRecord.id : "anonymous";
    const userEmail = typeof userRecord?.email === "string" ? userRecord.email : undefined;
    const unlimitedAccount = isUnlimitedAccount(userEmail) || isUnlimitedUserRecord(userRecord);

    const rawVariationCount = Number(options?.variationCount) || 1;
    const variationCount = unlimitedAccount
        ? Math.max(1, rawVariationCount)
        : Math.min(Math.max(1, rawVariationCount), 4);
    let prediction: StoredPrediction | null = null;

    const modelConfig = await getModelById(model);

    if (!modelConfig || !modelConfig.enabled) {
        return NextResponse.json(
            {
                error: "Requested model is not available",
            },
            { status: 400 }
        );
    }

    if (modelConfig.provider !== "azure") {
        return NextResponse.json(
            {
                error: "Only Azure models are supported",
            },
            { status: 400 }
        );
    }

    if (!modelConfig.endpoint || !modelConfig.apiKey) {
        return NextResponse.json(
            {
                error: "Model endpoint or API key is missing",
            },
            { status: 500 }
        );
    }

    // Check rate limit
    if (!checkRateLimit(userId, unlimitedAccount)) {
        return NextResponse.json(
            {
                error: "Rate limit exceeded. Please wait before making more requests.",
            },
            { status: 429 }
        );
    }

    try {
        // Generate all variations (Azure Flux API only supports n=1, so make multiple calls)
        const variationPromises = Array.from({ length: variationCount }, () =>
            callAzureFluxAPI(
                modelConfig.endpoint,
                modelConfig.apiKey,
                prompts,
                model,
                ratio,
                modelConfig.quality
            )
        );

        const azureResponses = await Promise.all(variationPromises);
        const allImageUrls: string[] = [];
        const predictionId = Date.now().toString();

        // Process each variation
        for (let i = 0; i < azureResponses.length; i++) {
            const azureResponse = azureResponses[i];

            // Check content safety filters
            const safetyCheck = checkContentSafety(azureResponse);
            if (safetyCheck.filtered) {
                console.warn(`Variation ${i + 1} filtered by Azure safety filters:`, safetyCheck.reason);
                continue; // Skip this variation but continue with others
            }

            const firstData = azureResponse.data?.[0];
            if (!firstData) {
                console.warn(`No image data returned for variation ${i + 1}`);
                continue;
            }

            const base64Data = firstData.b64_json;
            const imageUrl = firstData.url;

            let finalImageUrl: string | null = null;

            if (base64Data) {
                console.debug(`Processing base64 image (${base64Data.length} chars) for variation ${i + 1}`);
                finalImageUrl = await uploadBase64Image(base64Data, model, userId);

                if (!finalImageUrl) {
                    console.warn(`Failed to upload variation ${i + 1}`);
                    continue;
                }
            } else if (imageUrl) {
                finalImageUrl = imageUrl;
            } else {
                console.warn(`No image data in Azure response for variation ${i + 1}`);
                continue;
            }

            allImageUrls.push(finalImageUrl);

            // Store each variation in database
            const generationPayload = {
                prompt: prompts || "",
                aspect_ratio: ratio || "1:1",
                isPublic: typeof isPublic === "boolean" ? isPublic : true,
                model,
                generation: finalImageUrl,
                imgUrl: finalImageUrl,
                predictionId: predictionId,
                userId: userId !== "anonymous" ? userId : null,
                variationIndex: i,
                totalVariations: variationCount,
            };

            const [generationError] = await to(insertGeneration(generationPayload));

            if (generationError) {
                console.error(`Failed to persist variation ${i + 1}:`, generationError);
            }
        }

        if (allImageUrls.length === 0) {
            throw new Error("All variations failed to generate or were filtered");
        }

        // Create a prediction object with all variations
        prediction = {
            id: predictionId,
            status: "succeeded",
            output: allImageUrls.length === 1 ? allImageUrls[0] : allImageUrls.join(","),
            dataId: predictionId,
        };
    } catch (error: unknown) {
        const message = extractErrorMessage(error, "Azure Flux API error");
        console.error("Azure Flux API error:", error);
        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 }
        );
    }

    if (!prediction) {
        throw new Error("Prediction payload missing after Azure Flux call");
    }

    return NextResponse.json(prediction, { status: 201 });
}
