// import { getServerAuthSession } from "@/auth";
// import CTASection from "@/components/CTA/CTASection";
import FeatureSection from "@/components/Feature/FeatureSection";
import FooterSection from "@/components/Footer/FooterSection";
import HeroSection from "@/components/Hero/heroSection";
import HowItWorks from "@/components/How/HowItWorks";
import { Toaster } from "sonner";
import { getTranslations } from "next-intl/server";


import { languages, siteConfig } from "@/config/site";

export async function generateMetadata({ params }: any) {
    const t = await getTranslations("Home");

    return {
        title: t("layoutTitle"),
        description: t("layoutDescription"),
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.png",
            apple: "/favicon.png",
        },
        alternates: {
            canonical: `${siteConfig.url}${
                params.locale === "en" ? "" : `/${params.locale}`
            }`,
            languages: {
                ...Object.fromEntries(
                    languages.map((item) => [item.hrefLang, `/${item.lang}`])
                ),
                "x-default": "/",
            },
        },
    };
}

export default async function Home() {
    // const session: any = await getServerAuthSession();
    // const t = await getTranslations('Home');
    return (
        <main className="pt-4 relative z-50">
            <HeroSection />
            <FeatureSection />
            <HowItWorks />
            {/* <CTASection /> */}
            <FooterSection />
            <Toaster position="top-center" richColors />
        </main>
    );
}
