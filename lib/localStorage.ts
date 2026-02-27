import fs from "fs/promises";
import path from "path";
import { lookup } from "mime-types";

export interface LocalUploadParams {
    FileName: string; // filename -> eg. "image.jpg"
    fileBuffer: Buffer;
    objectKey: string; // object key -> eg. "generated/user123/image.jpg"
}

// Base directory for local storage (public/generated)
const LOCAL_STORAGE_BASE = path.join(process.cwd(), "public", "generated");

/**
 * Upload file to local filesystem storage
 * This will serve as primary storage (eventually cache)
 */
export async function uploadFileLocally(params: LocalUploadParams): Promise<string | null> {
    const { FileName, fileBuffer, objectKey } = params;

    try {
        // Sanitize objectKey to prevent path traversal
        const sanitizedKey = path.normalize(objectKey).replace(/^(\.\.\/)+/, "");
        if (sanitizedKey.includes("..") || path.isAbsolute(sanitizedKey)) {
            console.error("[LOCAL STORAGE] Rejected path traversal attempt:", objectKey);
            return null;
        }

        // Construct the full file path
        const fullPath = path.join(LOCAL_STORAGE_BASE, sanitizedKey);
        const directory = path.dirname(fullPath);

        // Ensure directory exists
        await fs.mkdir(directory, { recursive: true });

        // Write the file (convert Buffer to Uint8Array for compatibility)
        await fs.writeFile(fullPath, new Uint8Array(fileBuffer));

        console.log("[LOCAL STORAGE] File uploaded successfully:", objectKey);

        // Return the public URL path
        // Images in public/ are served from /
        return `/generated/${objectKey}`;
    } catch (error) {
        console.error("[LOCAL STORAGE] Error uploading file:", error);
        return null;
    }
}

/**
 * Delete file from local filesystem storage
 */
export async function deleteFileLocally(objectKey: string): Promise<boolean> {
    try {
        const sanitizedKey = path.normalize(objectKey).replace(/^(\.\.\/)+/, "");
        if (sanitizedKey.includes("..") || path.isAbsolute(sanitizedKey)) {
            console.error("[LOCAL STORAGE] Rejected path traversal attempt:", objectKey);
            return false;
        }
        const fullPath = path.join(LOCAL_STORAGE_BASE, sanitizedKey);
        await fs.unlink(fullPath);
        console.log("[LOCAL STORAGE] File deleted successfully:", objectKey);
        return true;
    } catch (error) {
        console.error("[LOCAL STORAGE] Error deleting file:", error);
        return false;
    }
}

/**
 * Check if file exists in local storage
 */
export async function fileExistsLocally(objectKey: string): Promise<boolean> {
    try {
        const sanitizedKey = path.normalize(objectKey).replace(/^(\.\.\/)+/, "");
        if (sanitizedKey.includes("..") || path.isAbsolute(sanitizedKey)) return false;
        const fullPath = path.join(LOCAL_STORAGE_BASE, sanitizedKey);
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get file metadata from local storage
 */
export async function getFileMetadata(objectKey: string): Promise<{
    size: number;
    mimeType: string | false;
    created: Date;
} | null> {
    try {
        const fullPath = path.join(LOCAL_STORAGE_BASE, objectKey);
        const stats = await fs.stat(fullPath);
        const mimeType = lookup(fullPath);

        return {
            size: stats.size,
            mimeType,
            created: stats.birthtime,
        };
    } catch (error) {
        console.error("[LOCAL STORAGE] Error getting file metadata:", error);
        return null;
    }
}

/**
 * List all files in a directory
 */
export async function listLocalFiles(prefix: string = ""): Promise<string[]> {
    try {
        const directory = path.join(LOCAL_STORAGE_BASE, prefix);
        const files = await fs.readdir(directory, { recursive: true });
        return files as string[];
    } catch (error) {
        console.error("[LOCAL STORAGE] Error listing files:", error);
        return [];
    }
}
