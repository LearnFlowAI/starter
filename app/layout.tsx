import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import SwRegister from "./sw-register";

const display = Newsreader({ subsets: ["latin"], variable: "--font-display" });
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"]
});

export const metadata: Metadata = {
  title: "LearnFlow Starter",
  description: "MVP 计时与积分闭环演示",
  manifest: "/manifest.json",
  themeColor: "#F6F1E6"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${body.variable}`}>
      <body className="noise">
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
