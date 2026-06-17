import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    // Escala de tipografía levemente más grande en todo el proyecto (legibilidad).
    // Solo afecta font-size/line-height — spacing y anchos (rem) quedan intactos.
    fontSize: {
      xs:    ["0.8125rem", { lineHeight: "1.15rem" }],  // 13px (antes 12px)
      sm:    ["0.9375rem", { lineHeight: "1.35rem" }],  // 15px (antes 14px)
      base:  ["1.0625rem", { lineHeight: "1.6rem"  }],  // 17px (antes 16px)
      lg:    ["1.1875rem", { lineHeight: "1.75rem" }],  // 19px (antes 18px)
      xl:    ["1.3125rem", { lineHeight: "1.75rem" }],  // 21px (antes 20px)
      "2xl": ["1.5625rem", { lineHeight: "2rem"    }],  // 25px (antes 24px)
      "3xl": ["1.9375rem", { lineHeight: "2.25rem" }],  // 31px (antes 30px)
      "4xl": ["2.3125rem", { lineHeight: "2.5rem"  }],  // 37px (antes 36px)
      "5xl": ["3.125rem",  { lineHeight: "1" }],
      "6xl": ["3.875rem",  { lineHeight: "1" }],
      "7xl": ["4.625rem",  { lineHeight: "1" }],
      "8xl": ["6.125rem",  { lineHeight: "1" }],
      "9xl": ["8.125rem",  { lineHeight: "1" }],
    },
  },
  plugins: [],
};

export default config;
