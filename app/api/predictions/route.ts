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
    model: string
) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            prompt: prompts,
            // Add other parameters as needed for Azure Flux API
        }),
    });

    if (!response.ok) {
        throw new Error(`Azure API error: ${response.statusText}`);
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
                model
            );
            
            // Create a prediction object compatible with the existing flow
            prediction = {
                id: azureResponse.id || Date.now().toString(),
                status: "succeeded",
                output: azureResponse.output || azureResponse.result,
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
