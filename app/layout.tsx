import "./globals.css";
import type { Metadata } from "next";
import {
  Noto_Sans_SC,
  Nunito,
  Plus_Jakarta_Sans,
  Poppins
} from "next/font/google";
import SwRegister from "./sw-register";
import AppProvider from "./components/AppProvider";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});
const noto = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "700"]
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"]
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "LearnFlow",
  description: "专注你的每一次进步",
  manifest: "/manifest.json",
  themeColor: "#F5F7FA"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${poppins.variable} ${noto.variable} ${nunito.variable} ${jakarta.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
        />
      </head>
      <body className="bg-background-light text-text-main-light antialiased transition-colors duration-300">
        <div
          data-testid="mobile-view-container"
          className="mobile-view-container"
        >
          <AppProvider>
            <SwRegister />
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  );
}
