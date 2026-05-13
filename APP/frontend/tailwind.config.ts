import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#12121f",
          dark: "#0d0c12",
          darker: "#0a0a14",
          light: "#1a1a2e",
          hover: "#1e1e32",
        },
        accent: {
          DEFAULT: "#fb923c",
          orange: "#fb923c",
          pink: "#f472b6",
          rose: "#f43f5e",
          warm: "#f97316",
        },
        muted: {
          DEFAULT: "#64748b",
          light: "#94a3b8",
          dark: "#475569",
          border: "#1e293b",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair-display)", "serif"],
        sans: ["var(--font-inter)", "var(--font-noto-sans-sc)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "pulse-soft": "pulse 2s ease-in-out infinite",
        "gradient-shift": "gradientShift 3s ease infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "hero-breathe": "heroBreathe 8s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        heroBreathe: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
