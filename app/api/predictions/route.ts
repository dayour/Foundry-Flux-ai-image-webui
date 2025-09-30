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
    // Convert ratio to dimensions (Azure expects width/height)
    const dimensionMap: Record<string, { width: number; height: number }> = {
        "1:1": { width: 1024, height: 1024 },
        "16:9": { width: 1344, height: 768 },
        "9:16": { width: 768, height: 1344 },
        "3:2": { width: 1216, height: 832 },
        "2:3": { width: 832, height: 1216 },
    };

    const dimensions = dimensionMap[ratio] || { width: 1024, height: 1024 };

    const requestBody: any = {
        prompt: prompts,
        width: dimensions.width,
        height: dimensions.height,
    };

    // Add model-specific parameters
    if (model === "azure-flux-1.1-pro") {
        // FLUX 1.1 [pro] supports up to 4MP images and has Ultra/Raw modes
        // Default to 40-50 steps for best quality as per documentation
        requestBody.num_inference_steps = 40;
    } else if (model === "azure-flux-kontext-pro") {
        // FLUX.1 Kontext [pro] for image editing converges in < 30 steps
        requestBody.num_inference_steps = 25;
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
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
            
            // Create a prediction object compatible with the existing flow
            // Azure returns the image URL directly or in a result/output field
            prediction = {
                id: azureResponse.id || Date.now().toString(),
                status: "succeeded",
                output: azureResponse.image || azureResponse.output || azureResponse.result || azureResponse.url,
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
