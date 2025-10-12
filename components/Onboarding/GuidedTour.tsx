"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface TourStep {
    id: string;
    title: string;
    description: string;
    selector: string;
}

const STORAGE_KEY = "autogen.design.tour.dismissed";

const steps: TourStep[] = [
    {
        id: "prompt",
        title: "Craft your prompt",
        description: "Describe the scene or asset you need. Specific details lead to richer Flux results.",
        selector: "[data-tour-id='prompt']",
    },
    {
        id: "controls",
        title: "Tune styles",
        description: "Open the advanced controls to pick models, ratios, variations, and structured assets.",
        selector: "[data-tour-id='controls']",
    },
    {
        id: "generate",
        title: "Generate content",
        description: "Launch a Flux render. We queue multiple variations and show progress in real-time.",
        selector: "[data-tour-id='generate']",
    },
    {
        id: "gallery",
        title: "Review outputs",
        description: "Zoom, download, or retry from here. Every variation stays accessible in the gallery.",
        selector: "[data-tour-id='gallery']",
    },
];

export default function GuidedTour() {
    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const dismissed = window.localStorage.getItem(STORAGE_KEY);
        if (dismissed === "true") {
            return;
        }
        setActive(true);
    }, []);

    const currentStep = useMemo(() => steps[stepIndex], [stepIndex]);

    useEffect(() => {
        if (!active || !currentStep) {
            return;
        }
        const target = document.querySelector<HTMLElement>(currentStep.selector);
        if (target) {
            target.classList.add("tour-highlight");
            target.setAttribute("data-tour-active", "true");
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            target.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
        }
        return () => {
            if (target) {
                target.classList.remove("tour-highlight");
                target.removeAttribute("data-tour-active");
            }
        };
    }, [active, currentStep]);

    const dismiss = useCallback(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, "true");
        }
        setActive(false);
    }, []);

    const goNext = useCallback(() => {
        if (stepIndex >= steps.length - 1) {
            dismiss();
            return;
        }
        setStepIndex((index) => Math.min(index + 1, steps.length - 1));
    }, [dismiss, stepIndex]);

    const goPrevious = useCallback(() => {
        setStepIndex((index) => Math.max(index - 1, 0));
    }, []);

    if (!active || !currentStep) {
        return null;
    }

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[80] max-w-xs rounded-2xl border border-white/12 bg-midnight-950/90 p-4 text-white shadow-[0_18px_48px_rgba(3,0,12,0.55)] backdrop-blur"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-200">Guided tour</p>
                    <h2 className="mt-1 text-base font-semibold text-white">{currentStep.title}</h2>
                </div>
                <button
                    type="button"
                    aria-label="Skip tour"
                    className="rounded-full border border-white/20 p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                    onClick={dismiss}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <p className="mt-3 text-sm text-white/70">{currentStep.description}</p>

            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-1">
                    {steps.map((step, index) => (
                        <span
                            key={step.id}
                            className={`inline-block h-1.5 w-6 rounded-full transition-all ${
                                index <= stepIndex ? "bg-primary/80" : "bg-white/15"
                            }`}
                        ></span>
                    ))}
                </div>
                <span>
                    {stepIndex + 1}/{steps.length}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={goPrevious}
                    disabled={stepIndex === 0}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                </button>
                <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/20 px-3 py-2 text-xs font-semibold text-primary-200 transition hover:bg-primary/30 focus-visible:shadow-focus-ring"
                >
                    {stepIndex === steps.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
