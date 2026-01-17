import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-noto)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "sans-serif"]
      },
      colors: {
        primary: "#30E3CA",
        secondary: "#FFD54F",
        moss: "#10B981",
        "background-light": "#F5F7FA",
        "background-dark": "#121212",
        "card-light": "#FFFFFF",
        "card-dark": "#1E1E1E",
        "text-main-light": "#333333",
        "text-main-dark": "#E0E0E0"
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem"
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(0,0,0,0.08)",
        glow: "0 0 20px rgba(48, 227, 202, 0.5)",
        card: "0 4px 20px rgba(0, 0, 0, 0.03)",
        clay:
          "8px 8px 16px 0px rgba(0, 0, 0, 0.06), -6px -6px 14px 0px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.5)"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
