import { NextResponse } from "next/server";
import {
    deleteModelConfig,
    getModelById,
    sanitizeModelForClient,
    updateModelConfig,
} from "@/lib/modelsConfig";

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const model = await getModelById(params.id);
        if (!model) {
            return NextResponse.json(
                { success: false, error: "Model not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            model: sanitizeModelForClient(model),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load model";
        console.error("Failed to load model:", error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const updates = body ?? {};
        const model = await updateModelConfig(params.id, updates);
        return NextResponse.json({
            success: true,
            model: sanitizeModelForClient(model),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update model";
        console.error("Failed to update model:", error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await deleteModelConfig(params.id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete model";
        console.error("Failed to delete model:", error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
