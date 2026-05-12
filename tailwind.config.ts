import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Refined gold — warm, never sun-yellow.
        gold: {
          50:  "#FBF4E3",
          100: "#F4E4BC",
          200: "#E9CE85",
          300: "#DDB75C",
          400: "#D4A85C",
          500: "#C49142",
          600: "#A37A2E",
          700: "#7A5B22",
          800: "#523D17",
          900: "#2B1F0B",
        },
        // Deep navy / nightsky.
        navy: {
          50:  "#E7EAF1",
          100: "#C8D0DC",
          200: "#8C9BB3",
          300: "#5A6B85",
          400: "#324563",
          500: "#1B2A45",
          600: "#0F1B33",
          700: "#0B1322",
          800: "#070D17",
          900: "#03060C",
        },
        // Neutral charcoal / ash.
        ash: {
          100: "#D7D5D0",
          200: "#A8A59D",
          300: "#76736C",
          400: "#4A4843",
          500: "#2A2F3E",
          600: "#1A1F2E",
          700: "#13182A",
        },
        bone: "#EFE8DA",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(212,168,92,0.0), rgba(212,168,92,0.15) 50%, rgba(212,168,92,0.0))",
        "radial-gold":
          "radial-gradient(ellipse at top, rgba(212,168,92,0.12), transparent 60%)",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(212,168,92,0.30), 0 8px 24px -10px rgba(212,168,92,0.35)",
        inset: "inset 0 0 0 1px rgba(232,225,213,0.08)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.55" },
          "50%":      { opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        pulseGold: "pulseGold 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
