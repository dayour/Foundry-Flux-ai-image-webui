import { insertGeneration } from "@/models/generation";
import { getUserInfo, updateUserInfo } from "@/models/user";
import to from "await-to-js";
import { NextResponse } from "next/server";
import { defaultStorageService } from "@/lib/storage";
import { nanoid } from "nanoid";
import { getModelById } from "@/lib/modelsConfig";
// import { Client } from "@gradio/client";
// import to from "await-to-js";

async function getFileBlob(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
}

// Rate limiting for Azure API calls
const azureRateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per user

function checkRateLimit(userId: string): boolean {
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
        console.log(`Base64 image size: ${sizeKB}KB (model: ${model})`);

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
            console.log(`Successfully uploaded image: ${objectKey}`);
        }

        return url;
    } catch (error) {
        console.error("Error uploading base64 image:", error);
        return null;
    }
}

// Check if content was filtered by Azure's safety filters
function checkContentSafety(azureResponse: any): { filtered: boolean; reason?: string } {
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
    const requestBody: any = {
        prompt: prompts,
        n: 1,
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
        throw new Error(`Azure API error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

export async function POST(request: Request) {
    const { prompts, ratio, model, isPublic, user } = await request.json();

    let prediction: any = null;

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
    const userId = user?.id || "anonymous";
    if (!checkRateLimit(userId)) {
        return NextResponse.json(
            {
                error: "Rate limit exceeded. Please wait before making more requests.",
            },
            { status: 429 }
        );
    }

    try {
            const azureResponse = await callAzureFluxAPI(
                modelConfig.endpoint,
                modelConfig.apiKey,
                prompts,
                model,
                ratio,
                modelConfig.quality
            );

            // Check content safety filters
            const safetyCheck = checkContentSafety(azureResponse);
            if (safetyCheck.filtered) {
                console.warn("Content filtered by Azure safety filters:", safetyCheck.reason);
                return NextResponse.json(
                    {
                        error: safetyCheck.reason || "Content was filtered by safety filters",
                    },
                    { status: 400 }
                );
            }
            
            // Azure OpenAI Image API returns data in format:
            // { created: timestamp, data: [{ url: "...", b64_json: "...", revised_prompt: "..." }] }
            const base64Data = azureResponse.data?.[0]?.b64_json;
            const imageUrl = azureResponse.data?.[0]?.url;
            
            let finalImageUrl: string | null = null;

            // If we have base64 data, convert and upload it
            if (base64Data) {
                console.log(`Processing base64 image (${base64Data.length} chars) from Azure Flux`);
                finalImageUrl = await uploadBase64Image(base64Data, model, userId);
                
                if (!finalImageUrl) {
                    throw new Error("Failed to upload base64 image to storage");
                }
            } else if (imageUrl) {
                // If Azure provides a direct URL (unlikely but possible)
                finalImageUrl = imageUrl;
            } else {
                console.error("Azure response does not contain image data:", azureResponse);
                throw new Error("No image data in Azure response");
            }
            
            // Create a prediction object compatible with the existing flow
            prediction = {
                id: azureResponse.created?.toString() || Date.now().toString(),
                status: "succeeded",
                output: finalImageUrl,
                dataId: Date.now().toString(), // For tracking
            };

            const generationPayload = {
                prompt: prompts || "",
                aspect_ratio: ratio || "1:1",
                isPublic: typeof isPublic === "boolean" ? isPublic : true,
                model,
                generation: finalImageUrl,
                imgUrl: finalImageUrl,
                predictionId: prediction.id,
                userId: userId !== "anonymous" ? userId : null,
            };

            const [generationError, generationRecord] = await to(
                insertGeneration(generationPayload)
            );

            if (generationError) {
                console.error("Failed to persist generation record:", generationError);
            } else if (generationRecord?.id) {
                prediction.dataId = generationRecord.id;
            }
    } catch (error: any) {
        console.error("Azure Flux API error:", error);
        return NextResponse.json(
            {
                error: error.message,
            },
            { status: 500 }
        );
    }

    console.log("prediction:", prediction);

    return NextResponse.json(prediction, { status: 201 });
}
