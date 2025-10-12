/**
 * GenerationModeSwitcher - Tab interface for switching between generation modes
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GENERATION_MODES } from "./generationModes";
import type { GenerationMode } from "./types";

interface GenerationModeSwitcherProps {
  currentMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  className?: string;
}

export default function GenerationModeSwitcher({
  currentMode,
  onModeChange,
  className,
}: GenerationModeSwitcherProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Dropdown */}
      <div className="md:hidden">
        <select
          value={currentMode}
          onChange={(e) => onModeChange(e.target.value as GenerationMode)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#7b61ff]/50"
          aria-label="Select generation mode"
        >
          {GENERATION_MODES.map((mode) => (
            <option key={mode.id} value={mode.id} className="bg-[#08030d] text-white">
              {mode.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
          {GENERATION_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={cn(
                  "group relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-[#7b61ff]/20 to-[#7bd7ff]/10 text-white shadow-lg shadow-[#7b61ff]/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                )}
                title={mode.description}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-[#7bd7ff]" : "text-white/40 group-hover:text-white/70"
                  )}
                />
                <span>{mode.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-0.5 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7b61ff] to-[#7bd7ff]" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Mode description */}
        <p className="mt-3 text-center text-xs text-white/40">
          {GENERATION_MODES.find((m) => m.id === currentMode)?.description}
        </p>
      </div>
    </div>
  );
}
