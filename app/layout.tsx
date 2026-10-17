import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Official Akogun Furniture — Considered Furniture & Interiors",
    template: "%s | Official Akogun Furniture",
  },
  description:
    "Discover considered, made-to-measure furniture, bespoke cabinetry and interior woodwork by Official Akogun Furniture.",
  openGraph: {
    type: "website",
    siteName: "Official Akogun Furniture",
    locale: "en_GB",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-obsidian text-ivory">{children}</body>
    </html>
  );
}
