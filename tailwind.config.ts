import type { Config } from "tailwindcss";
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px rgb(0 0 0 / 0.04), 0 12px 24px rgb(0 0 0 / 0.08)",
        glow: "0 0 0 1px rgb(99 102 241 / 0.12), 0 12px 40px -8px rgb(99 102 241 / 0.25)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
      },
    },
  },
  plugins: [
    forms({
      strategy: "class",
    }),
    typography,
    containerQueries,
  ],
} satisfies Config;
