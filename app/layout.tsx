import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlightTrace",
  description:
    "Track flights in real-time with comprehensive flight information, interactive maps, and live updates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body suppressHydrationWarning className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
