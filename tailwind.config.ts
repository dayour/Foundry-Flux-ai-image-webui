import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/preline/preline.js",
        "node_modules/preline/dist/*.js",
        // './node_modules/preline/dist/*.js'
    ],
    // enable dark mode via class strategy
    darkMode: "selector",
    // darkMode: ['variant', [
    //     '@media (prefers-color-scheme: dark) { &:not(.light *) }',
    //     '&:is(.dark *)',
    // ]],

    theme: {
        extend: {
            colors: {
                midnight: {
                    900: "#080315",
                    950: "#05010E",
                },
                primary: {
                    DEFAULT: "#7BD7FF",
                    200: "#9EE6FF",
                    300: "#6BC4F0",
                },
                accent: {
                    DEFAULT: "#8A64FF",
                    200: "#A98BFF",
                },
            },
            boxShadow: {
                "focus-ring": "0 0 0 3px rgba(124, 215, 255, 0.45)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            keyframes: {
                "hero-glow": {
                    "0%": { transform: "translate3d(-10%, -8%, 0) scale(1)" },
                    "50%": { transform: "translate3d(6%, 4%, 0) scale(1.05)" },
                    "100%": { transform: "translate3d(-10%, -8%, 0) scale(1)" },
                },
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "hero-glow": "hero-glow 16s ease-in-out infinite",
                "fade-up": "fade-up 550ms ease-out both",
            },
        },
    },
    plugins: [require("preline/plugin"), require('@tailwindcss/forms'), require("@tailwindcss/typography")],
};
export default config;
