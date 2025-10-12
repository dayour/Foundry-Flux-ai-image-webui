/* eslint-disable react/no-unescaped-entities */
"use client";
import { BookOpen, Megaphone, Palette, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const ApplicationsOf = () => {
    const t = useTranslations("Generation");
    const applicationsKeys = Array.from(
        { length: Number(t("applications.length")) },
        (_, i) => i + 1
    );
    const icons: any = {
        "1": <Palette className="w-5 h-5 shrink-0 mt-2 size-8 text-gray-800 dark:text-white" />,
        "2": <Megaphone className="w-5 h-5 shrink-0 mt-2 size-8 text-gray-800 dark:text-white" />,
        "3": <BookOpen className="w-5 h-5 shrink-0 mt-2 size-8 text-gray-800 dark:text-white" />,
        "4": <Sparkles className="w-5 h-5 shrink-0 mt-2 size-8 text-gray-800 dark:text-white" />,
    }

    return (
        <section className="w-full" id="Applications">
            <div className="max-w-[85rem] px-4 py-10 mt-32 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                <div className="mx-auto text-center mb-10 lg:mb-14">
                    <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
                        {t("applicationsTitle")}
                    </h2>
                    {/* <p class="mt-1 text-gray-600 dark:text-neutral-400">Answers to the most frequently asked questions.</p> */}
                </div>

                <div className="mx-auto">
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                         {/* Icon Block */}
                         {applicationsKeys.map((index: number) => (
                            <div key={index} className="flex gap-x-5 sm:gap-x-8 items-start rounded-lg bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm dark:from-neutral-900 dark:to-neutral-800/40">
                                <div className="flex-shrink-0">
                                    <div className="rounded-md p-2 bg-indigo-50 dark:bg-indigo-900/20">
                                        {icons[String(index)]}
                                    </div>
                                </div>
                                <div className="grow">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200">
                                            {t(`applications.${index}.title`)}
                                        </h3>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-neutral-800">Use case</span>
                                    </div>
                                    <p className="mt-1 text-gray-600 dark:text-neutral-400">
                                        {t(`applications.${index}.description`)}
                                    </p>
                                </div>
                            </div>
                         ))}
                        {/* End Icon Block */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ApplicationsOf;
