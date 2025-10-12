import { uploadFile as uploadToR2 } from "./s3";
import { uploadFileLocally } from "./localStorage";

export type StorageProvider = "local" | "r2";

export interface StorageConfig {
    provider: StorageProvider;
    fallbackToLocal?: boolean; // Fallback to local if R2 fails
}

export interface UploadImageParams {
    FileName: string;
    fileBuffer: Buffer;
    objectKey: string;
}

// Default storage configuration
// Can be overridden via environment variable
const DEFAULT_STORAGE: StorageProvider = 
    (process.env.STORAGE_PROVIDER as StorageProvider) || "local";

/**
 * Unified storage service that supports multiple providers
 * Primary use: local storage (will become cache in future)
 * Fallback: R2 storage
 */
export class StorageService {
    private config: StorageConfig;

    constructor(config?: Partial<StorageConfig>) {
        this.config = {
            provider: config?.provider || DEFAULT_STORAGE,
            fallbackToLocal: config?.fallbackToLocal ?? true,
        };
    }

    /**
     * Upload file to configured storage provider
     */
    async uploadFile(params: UploadImageParams): Promise<string | null> {
        const { FileName, fileBuffer, objectKey } = params;

        console.log(`[STORAGE SERVICE] Uploading to ${this.config.provider}: ${objectKey}`);

        try {
            if (this.config.provider === "local") {
                return await this.uploadToLocal(params);
            } else if (this.config.provider === "r2") {
                return await this.uploadToR2(params);
            }

            throw new Error(`Unknown storage provider: ${this.config.provider}`);
        } catch (error) {
            console.error(`[STORAGE SERVICE] Upload failed with ${this.config.provider}:`, error);

            // Fallback to local storage if enabled
            if (this.config.provider === "r2" && this.config.fallbackToLocal) {
                console.log("[STORAGE SERVICE] Attempting fallback to local storage...");
                try {
                    return await this.uploadToLocal(params);
                } catch (fallbackError) {
                    console.error("[STORAGE SERVICE] Fallback to local storage failed:", fallbackError);
                }
            }

            return null;
        }
    }

    /**
     * Upload to local filesystem storage
     */
    private async uploadToLocal(params: UploadImageParams): Promise<string | null> {
        const result = await uploadFileLocally(params);
        
        if (result) {
            // Return absolute URL for local storage
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            return `${baseUrl}${result}`;
        }
        
        return null;
    }

    /**
     * Upload to R2 cloud storage
     */
    private async uploadToR2(params: UploadImageParams): Promise<string | null> {
        return await uploadToR2(params);
    }

    /**
     * Get current storage provider
     */
    getProvider(): StorageProvider {
        return this.config.provider;
    }

    /**
     * Switch storage provider
     */
    setProvider(provider: StorageProvider): void {
        this.config.provider = provider;
        console.log(`[STORAGE SERVICE] Storage provider switched to: ${provider}`);
    }
}

// Export singleton instance
export const defaultStorageService = new StorageService();

// Helper function for backward compatibility
export async function uploadImage(params: UploadImageParams): Promise<string | null> {
    return await defaultStorageService.uploadFile(params);
}
