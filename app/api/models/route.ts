import { NextResponse } from "next/server";
import {
    createModelConfig,
    loadModelsConfig,
    sanitizeModelForClient,
} from "@/lib/modelsConfig";

export async function GET() {
    try {
        const models = await loadModelsConfig();
        return NextResponse.json({
            success: true,
            models: models.map(sanitizeModelForClient),
        });
    } catch (error: any) {
        console.error("Failed to load models:", error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Failed to load models",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id,
            label,
            provider = "azure",
            endpoint,
            apiKey,
            quality,
            enabled = true,
            description,
        } = body ?? {};

        if (!label || !endpoint || !apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Label, endpoint, and apiKey are required",
                },
                { status: 400 }
            );
        }

        if (provider !== "azure") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only Azure provider is supported",
                },
                { status: 400 }
            );
        }

        const model = await createModelConfig({
            id,
            label,
            provider,
            endpoint,
            apiKey,
            quality,
            enabled,
            description,
        });

        return NextResponse.json(
            {
                success: true,
                model: sanitizeModelForClient(model),
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Failed to create model:", error);
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Failed to create model",
            },
            { status: 500 }
        );
    }
}
