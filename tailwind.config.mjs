/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#00E5FF",
                secondary: "#2979FF",
                accent: "#FF2E93",
                "bg-dark": "#080812",
                "bg-panel": "rgba(255, 255, 255, 0.03)",
                "glass-border": "rgba(255, 255, 255, 0.08)",
            },
        },
    },
    plugins: [],
};
