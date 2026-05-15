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
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          dark: "rgb(var(--color-bg) / <alpha-value>)",
          darker: "rgb(var(--color-bg) / <alpha-value>)",
          light: "rgb(var(--color-surface-elevated) / <alpha-value>)",
          hover: "rgb(var(--color-surface-elevated) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-elevated) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          orange: "rgb(var(--color-accent) / <alpha-value>)",
          pink: "rgb(var(--color-accent-secondary) / <alpha-value>)",
          rose: "#f43f5e",
          warm: "#f97316",
          glow: "var(--color-accent-glow)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-text-muted) / <alpha-value>)",
          light: "#94a3b8",
          dark: "#475569",
          dim: "rgb(var(--color-text-muted) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          muted: "#34d399",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair-display)", "serif"],
        sans: ["var(--font-inter)", "var(--font-noto-sans-sc)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 20px -5px rgba(251,146,60,0.1)",
        "glow-md": "0 0 40px -10px rgba(251,146,60,0.15), 0 0 80px -20px rgba(244,114,182,0.08)",
        "glow-lg": "0 0 60px -15px rgba(251,146,60,0.2), 0 0 120px -30px rgba(244,114,182,0.1)",
        "card": "0 4px 24px -8px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 32px -8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
        "elevated": "0 8px 32px -12px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "hero-breathe": "heroBreathe 10s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        heroBreathe: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundSize: {
        "200": "200% 200%",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
