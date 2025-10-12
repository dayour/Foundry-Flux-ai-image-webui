import { siteConfig } from "@/config/site";

const Navs: any[] = [
    {
        label: "Resource",
        items: [
            { title: "Generation", href: "/ai-image-generator" },
            { title: "Explore", href: "/explore-image" },
            { title: "Pricing", href: "/pricing" },
        ],
    },
    {
        label: "Legal",
        items: [
            // { title: "Discover", href: "/discover" },
            {
                href: "/privacy-policy",
                title: "Privacy Policy",
            },
            {
                href: "/terms-of-service",
                title: "Terms & Conditions",
            },
        ],
    },
    {
        label: "Support",
        items: [
            {
                href: `mailto:support@${siteConfig.domain}`,
                title: `support@${siteConfig.domain}`,
            },
        ],
    },
    // Friends section removed per rebranding
];

export default Navs;
