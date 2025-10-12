/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import footerNavs from "./footerNavs";
import Brand from "@/components/Brand/Logo";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";

const FooterSection = () => {
    // const t = useTranslations("Metadata");

    return (
        <>
            <footer className="bg-white dark:bg-neutral-900">
                <div className="container px-6 py-12 mx-auto">

                    {/* <hr className="my-6 border-gray-200 md:my-10 dark:border-gray-700" /> */}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {footerNavs.map((item, idx) => (
                            <section key={idx}>
                                <p className="font-semibold text-gray-800 dark:text-white">
                                    {item.label}
                                </p>
                                {item.items.map((el: any, idx: number) => (
                                    <div className="flex flex-col items-start mt-5 space-y-2" key={idx}>
                                        <a
                                            href={el.href}
                                            className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:text-blue-500"
                                            title={el.title}
                                            rel="nofollow"
                                        >
                                            {el.content || el.title}
                                        </a>
                                    </div>
                                ))}
                            </section>
                        ))}
                        
                    </div>

                    <hr className="my-6 border-gray-200 md:my-10 dark:border-gray-700" />

                    <div className="flex flex-col items-center justify-between sm:flex-row">
                        <Brand />

                        <p className="mt-4 text-sm text-gray-500 sm:mt-0 dark:text-gray-300">
                            © Copyright 2025 {siteConfig.name}.
                        </p>
                    </div>
                </div>
            </footer>

            {/* legacy footer removed */}
        </>
    );
};

export default FooterSection;
