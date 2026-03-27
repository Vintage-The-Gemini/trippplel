import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        accent: "#CCFF00",       // neon yellow — drop culture
        "accent-red": "#FF0000", // classic streetwear red
        muted: "#6b7280",
        surface: "#F5F5F0",      // warm off-white
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["'Bebas Neue'", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["10rem", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["7rem",  { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-md": ["5rem",  { lineHeight: "0.95", letterSpacing: "-0.01em" }],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        fadeIn:  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
      },
      animation: {
        marquee: "marquee 20s linear infinite",
        fadeIn:  "fadeIn 0.4s ease forwards",
        slideIn: "slideIn 0.3s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
