"use client";

import React from "react";

export default function SkeletonLoader({ lines = 6 }: { lines?: number }) {
  return (
    <div className="w-full animate-pulse p-4">
      <div className="h-40 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 rounded-lg mb-3" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3 bg-neutral-800 rounded ${i % 3 === 0 ? 'w-5/6' : i % 3 === 1 ? 'w-3/4' : 'w-2/3'}`}
          />
        ))}
      </div>
    </div>
  );
}
