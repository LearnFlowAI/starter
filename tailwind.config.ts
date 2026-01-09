import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Newsreader", "serif"],
        body: ["IBM Plex Sans", "sans-serif"]
      },
      colors: {
        ink: "#10100F",
        parchment: "#F6F1E6",
        moss: "#2F5D50",
        cider: "#C47C2C",
        chalk: "#FBFAF7",
        plum: "#3B2B3D"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(16,16,15,0.12)",
        crisp: "0 8px 20px rgba(16,16,15,0.18)"
      }
    }
  },
  plugins: []
};

export default config;
