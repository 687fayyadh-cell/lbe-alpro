import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "./providers";
import "./globals.css";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SinergiITS",
  description: "Satu Pintu untuk Seluruh Peluang Pengembangan Diri di ITS.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`dark ${fontSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
