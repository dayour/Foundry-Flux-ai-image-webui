"use client";

import { FC, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SquareMousePointer, WandSparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection: FC = () => {
    const t = useTranslations("Home");
    const heroRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = heroRef.current;
        if (!node) {
            return;
        }

        let frame = 0;
        const handlePointerMove = (event: PointerEvent) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = node.getBoundingClientRect();
                const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
                const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
                node.style.setProperty("--hero-tilt-x", `${offsetX.toFixed(2)}deg`);
                node.style.setProperty("--hero-tilt-y", `${offsetY.toFixed(2)}deg`);
            });
        };

        const handlePointerLeave = () => {
            node.style.setProperty("--hero-tilt-x", "0deg");
            node.style.setProperty("--hero-tilt-y", "0deg");
        };

        node.addEventListener("pointermove", handlePointerMove);
        node.addEventListener("pointerleave", handlePointerLeave);

        return () => {
            node.removeEventListener("pointermove", handlePointerMove);
            node.removeEventListener("pointerleave", handlePointerLeave);
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative hero-bg overflow-hidden"
            aria-labelledby="hero-heading"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,215,255,0.12),transparent_55%)]" aria-hidden="true"></div>
            <div className="relative z-10 mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-20 md:pb-24">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-center">
                    <div className="text-left lg:text-left mx-auto w-full max-w-3xl lg:max-w-none animate-fade-up">
                        <p className="inline-flex items-center rounded-full bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200 backdrop-blur">
                            {t("hero.subtitle")}
                        </p>
                        <h1
                            id="hero-heading"
                            className="mt-6 font-semibold text-balance text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[1.05] text-white drop-shadow-[0_12px_32px_rgba(10,2,24,0.65)]"
                        >
                            {t("hero.title")}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl text-pretty hyphenate">
                            {t("hero.description")}
                        </p>

                        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <Link
                                href="/ai-image-generator"
                                className="group inline-flex w-full justify-center items-center gap-2 rounded-xl border border-primary/30 bg-primary text-midnight-950 px-5 py-3 text-sm font-semibold shadow-[0_12px_30px_rgba(123,215,255,0.35)] transition hover:bg-primary-200 focus-visible:shadow-focus-ring sm:w-auto"
                                aria-label={t("hero.tryButtonText")}
                            >
                                <SquareMousePointer className="h-5 w-5 transition-transform group-hover:-translate-y-[1px]" />
                                {t("hero.tryButtonText")}
                            </Link>
                            <Link
                                href="/ai-image-generator"
                                className="inline-flex w-full justify-center items-center gap-2 rounded-xl border border-white/25 bg-transparent px-5 py-3 text-sm font-semibold text-primary-200 transition hover:bg-white/10 focus-visible:shadow-focus-ring sm:w-auto"
                                aria-label={t("hero.buttonText")}
                            >
                                <WandSparkles className="h-5 w-5" />
                                {t("hero.buttonText")}
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-white/8 bg-gradient-to-br from-white/6 via-white/2 to-transparent shadow-[0_24px_60px_rgba(5,1,14,0.55)]" aria-hidden="true"></div>
                        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/50 p-2 shadow-[0_20px_50px_rgba(12,0,35,0.55)] hero-tilt">
                            <div className="relative overflow-hidden rounded-[1.35rem]">
                                <Image
                                    src="/autogen-hero-image.webp"
                                    alt="Autogen Design interface showcasing generated artwork"
                                    priority
                                    width={960}
                                    height={720}
                                    sizes="(max-width: 1024px) 100vw, 440px"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2OcqfL/PwAHWgNQx2oyWQAAAABJRU5ErkJggg=="
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="absolute inset-x-6 bottom-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white/80 backdrop-blur">
                                <p className="font-semibold uppercase tracking-[0.3em] text-primary-200">Flux Output Preview</p>
                                <p className="mt-1 text-sm text-white/65 line-clamp-2 text-balance">
                                    {t("hero.subtitle")}: {t("hero.description")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
