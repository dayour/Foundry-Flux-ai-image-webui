import { insertGeneration } from "@/models/generation";
import { getUserInfo, updateUserInfo } from "@/models/user";
import to from "await-to-js";
import { NextResponse } from "next/server";
import Replicate from "replicate";
// import { Client } from "@gradio/client";
// import to from "await-to-js";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function getFileBlob(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
}

async function callAzureFluxAPI(
    endpoint: string,
    apiKey: string,
    prompts: string,
    model: string,
    ratio: string
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
    if (model === "azure-flux-1.1-pro") {
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

    // Handle Azure Flux models
    if (model === "azure-flux-1.1-pro" || model === "azure-flux-kontext-pro") {
        const azureEndpoint =
            model === "azure-flux-1.1-pro"
                ? process.env.AZURE_FLUX_11_PRO_ENDPOINT
                : process.env.AZURE_FLUX_KONTEXT_PRO_ENDPOINT;
        const azureApiKey =
            model === "azure-flux-1.1-pro"
                ? process.env.AZURE_FLUX_11_PRO_API_KEY
                : process.env.AZURE_FLUX_KONTEXT_PRO_API_KEY;

        if (!azureEndpoint || !azureApiKey) {
            return NextResponse.json(
                {
                    error: "Azure Flux API endpoint or key not configured",
                },
                { status: 500 }
            );
        }

        try {
            const azureResponse = await callAzureFluxAPI(
                azureEndpoint,
                azureApiKey,
                prompts,
                model,
                ratio
            );
            
            // Azure OpenAI Image API returns data in format:
            // { created: timestamp, data: [{ url: "...", revised_prompt: "..." }] }
            const imageUrl = azureResponse.data?.[0]?.url || 
                           azureResponse.data?.[0]?.b64_json ||
                           azureResponse.url ||
                           azureResponse.image;
            
            if (!imageUrl) {
                console.error("Azure response does not contain image URL:", azureResponse);
                throw new Error("No image URL in Azure response");
            }
            
            // Create a prediction object compatible with the existing flow
            prediction = {
                id: azureResponse.created?.toString() || Date.now().toString(),
                status: "succeeded",
                output: imageUrl,
                dataId: Date.now().toString(), // For tracking
            };
        } catch (error: any) {
            console.error("Azure Flux API error:", error);
            return NextResponse.json(
                {
                    error: error.message,
                },
                { status: 500 }
            );
        }
    } else {
        // handle replicate / fal ... api for non-Azure models
    }

    console.log("prediction:", prediction);

    return NextResponse.json(
        {
            prediction,
        },
        { status: 201 }
    );
}
