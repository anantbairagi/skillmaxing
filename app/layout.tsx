import type { Metadata } from "next";
import { Chrome } from "@/components/Chrome";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Skillmaxing: Python with AI, Inference Engineering, System Design",
    template: "%s — Skillmaxing",
  },
  description: "Sequenced courses in Python with AI, inference engineering, system design, and a paper reading order. Study build with original notes.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,560;125,680;125,760;125,800&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap" rel="stylesheet" />
        </head>
      <body>
        <StoreProvider>
          <Chrome>{children}</Chrome>
        </StoreProvider>
      </body>
    </html>
  );
}
