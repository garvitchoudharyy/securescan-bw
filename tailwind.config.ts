import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'DM Sans'", "'Inter'", "sans-serif"],
        display: ["'Orbitron'", "monospace"],
      },
      colors: {
        bw: {
          bg:       "#000000",
          bg2:      "#0a0a0a",
          surface:  "#111111",
          card:     "#161616",
          border:   "#2a2a2a",
          border2:  "#333333",
          white:    "#ffffff",
          white2:   "#e8e8e8",
          gray1:    "#aaaaaa",
          gray2:    "#666666",
          gray3:    "#333333",
          muted:    "#444444",
        },
      },
      animation: {
        "pulse-white": "pulseWhite 2s ease-in-out infinite",
        "scan-line":   "scanLine 2s linear infinite",
        flicker:       "flicker 0.15s infinite",
      },
      keyframes: {
        pulseWhite: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255,255,255,0.1)" },
          "50%":      { boxShadow: "0 0 30px rgba(255,255,255,0.3)" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.8" },
        },
      },
      boxShadow: {
        "bw-sm": "0 0 10px rgba(255,255,255,0.05)",
        "bw-md": "0 0 20px rgba(255,255,255,0.08)",
        "bw-lg": "0 0 40px rgba(255,255,255,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
