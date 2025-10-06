import { NextResponse } from "next/server";
import { defaultStorageService, StorageProvider } from "@/lib/storage";

/**
 * GET /api/storage/config
 * Returns current storage configuration
 */
export async function GET() {
    try {
        const provider = defaultStorageService.getProvider();
        
        return NextResponse.json({
            provider,
            available: ["local", "r2"],
        });
    } catch (error) {
        console.error("Error getting storage config:", error);
        return NextResponse.json(
            { error: "Failed to get storage configuration" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/storage/config
 * Switches storage provider
 * Body: { provider: "local" | "r2" }
 */
export async function POST(request: Request) {
    try {
        const { provider } = await request.json();

        if (!provider || !["local", "r2"].includes(provider)) {
            return NextResponse.json(
                { error: "Invalid storage provider. Must be 'local' or 'r2'" },
                { status: 400 }
            );
        }

        defaultStorageService.setProvider(provider as StorageProvider);

        return NextResponse.json({
            success: true,
            provider: defaultStorageService.getProvider(),
            message: `Storage provider switched to ${provider}`,
        });
    } catch (error) {
        console.error("Error switching storage provider:", error);
        return NextResponse.json(
            { error: "Failed to switch storage provider" },
            { status: 500 }
        );
    }
}
