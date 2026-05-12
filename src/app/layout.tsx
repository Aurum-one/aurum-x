import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurum — AURX · Proof-of-Work, refined.",
  description:
    "Aurum (AURX) is a proof-of-work mineable ERC-20 on Base. Mine the new gold with your CPU. Fixed 100 AURX per block, 1,000 AURX wallet cap, 100M supply.",
  metadataBase: new URL("https://aurum.gold"),
  icons: {
    icon: [{ url: "/aurum-mark.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/aurum-mark.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Aurum — AURX",
    description: "Proof-of-Work, refined. Mineable ERC-20 on Base.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurum — AURX",
    description: "Proof-of-Work, refined. Mineable ERC-20 on Base.",
    site: "@Aurum_0x",
    creator: "@Aurum_0x",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sans.variable} ${mono.variable} ${display.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
