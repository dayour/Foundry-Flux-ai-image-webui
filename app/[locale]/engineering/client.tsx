"use client";

import Image from "next/image";
import { DiagramTypeSelector } from "@/components/Engineering/DiagramTypeSelector";
import { DiagramConfigEditor } from "@/components/Engineering/DiagramConfigEditor";
import { useEngineeringMode } from "@/hooks/useEngineeringMode";
import FooterSection from "@/components/Footer/FooterSection";
import ErrorBoundary from "@/components/Shared/ErrorBoundary";
import { Toaster } from "sonner";

interface EngineeringModeClientProps {
  userEmail: string;
}

export default function EngineeringModeClient({ userEmail }: EngineeringModeClientProps) {
  const {
    selectedType,
    selectedCategory,
    config,
    generating,
    generatedImage,
    error,
    canGenerate,
    handleTypeChange,
    handleConfigChange,
    handleGenerate,
  } = useEngineeringMode(userEmail);

  const isTypeSelected = Boolean(selectedType);

  return (
    <ErrorBoundary>
      <main className="pt-4 relative z-50">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="text-center mx-auto mb-12">
          <div className="mt-5">
            <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
              Engineering Mode
            </h1>
          </div>
          <div className="mt-5 max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              Generate professional CAD drawings, system diagrams, network topologies, circuit schematics, and architectural blueprints with the same polished Autogen experience.
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <header className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-200">Step 1</p>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Select Diagram Type</h2>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-midnight-950 text-sm font-semibold shadow-sm">
                  1
                </span>
              </header>
              <DiagramTypeSelector
                selectedType={selectedType}
                onSelectType={(type) => handleTypeChange(type, selectedCategory)}
              />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <header className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-200">Step 2</p>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Configure Diagram</h2>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-midnight-950 text-sm font-semibold shadow-sm">
                  2
                </span>
              </header>
              {isTypeSelected ? (
                <DiagramConfigEditor
                  diagramType={selectedType}
                  config={config}
                  onChange={handleConfigChange}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/10 p-6 text-sm text-gray-600 dark:text-neutral-400">
                  Select a diagram type to unlock configuration options such as detailed description, style, annotations, and measurement units.
                </div>
              )}
            </section>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-primary/40 bg-primary px-5 py-4 text-lg font-semibold text-midnight-950 shadow-[0_12px_30px_rgba(123,215,255,0.35)] transition hover:bg-primary-200 focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <span className="inline-flex items-center gap-2 text-base">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-midnight-950/40 border-t-midnight-950" aria-hidden="true" />
                  Generating diagram…
                </span>
              ) : (
                <>
                  <span>Generate Diagram</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-midnight-950/20 px-3 py-1 text-xs font-semibold text-midnight-950/80">
                    3 credits
                  </span>
                </>
              )}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}
          </div>

          <aside className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <section className="rounded-2xl border border-white/10 bg-white/60 p-6 shadow-[0_18px_48px_rgba(3,0,12,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                <header className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Preview</h2>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">Review the generated diagram, download assets, or export to additional formats.</p>
                  </div>
                </header>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 p-4">
                      <div className="relative w-full h-[480px]">
                        <Image
                          src={generatedImage}
                          alt="Generated engineering diagram"
                          className="rounded-lg bg-white p-2 object-contain"
                          fill
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="flex-1 min-w-[140px] rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:shadow-focus-ring">
                        Download PNG
                      </button>
                      <button className="flex-1 min-w-[140px] rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:shadow-focus-ring">
                        Export SVG
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="flex-1 min-w-[140px] rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:shadow-focus-ring">
                        Export PDF
                      </button>
                      <button className="flex-1 min-w-[140px] rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:shadow-focus-ring">
                        Export DXF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-white/60">
                    <svg
                      className="h-12 w-12 text-white/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="max-w-sm text-balance">Your generated diagram will appear here. Configure the diagram, then select “Generate Diagram” to produce a high-resolution output.</p>
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>

      <FooterSection />
      <Toaster position="top-center" richColors />
    </main>
    </ErrorBoundary>
  );
}
