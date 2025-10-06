"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Database, HardDrive, Cloud } from "lucide-react";

interface StorageConfig {
    provider: "local" | "r2";
    available: string[];
}

export default function StorageSwitcher() {
    const [config, setConfig] = useState<StorageConfig | null>(null);
    const [loading, setLoading] = useState(false);

    // Load current storage configuration
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch("/api/storage/config");
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error("Error fetching storage config:", error);
            toast.error("Failed to load storage configuration");
        }
    };

    const switchProvider = async (provider: "local" | "r2") => {
        if (loading || !config || config.provider === provider) return;

        setLoading(true);
        try {
            const response = await fetch("/api/storage/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ provider }),
            });

            const data = await response.json();

            if (response.ok) {
                setConfig({ ...config, provider });
                toast.success(data.message || `Switched to ${provider} storage`);
            } else {
                toast.error(data.error || "Failed to switch storage provider");
            }
        } catch (error) {
            console.error("Error switching storage provider:", error);
            toast.error("Failed to switch storage provider");
        } finally {
            setLoading(false);
        }
    };

    if (!config) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Database className="h-4 w-4 animate-pulse" />
                <span>Loading storage config...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage:
            </span>
            
            <div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                {/* Local Storage Button */}
                <button
                    onClick={() => switchProvider("local")}
                    disabled={loading || config.provider === "local"}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                        transition-all duration-200
                        ${
                            config.provider === "local"
                                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }
                        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    title="Use local filesystem storage (primary, will become cache)"
                >
                    <HardDrive className="h-3.5 w-3.5" />
                    <span>Local</span>
                    {config.provider === "local" && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                </button>

                {/* R2 Storage Button */}
                <button
                    onClick={() => switchProvider("r2")}
                    disabled={loading || config.provider === "r2"}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                        transition-all duration-200
                        ${
                            config.provider === "r2"
                                ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }
                        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    title="Use Cloudflare R2 cloud storage"
                >
                    <Cloud className="h-3.5 w-3.5" />
                    <span>R2</span>
                    {config.provider === "r2" && (
                        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                </button>
            </div>

            {loading && (
                <div className="ml-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
            )}
        </div>
    );
}
