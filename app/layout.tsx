import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YT-brief — Instant YouTube Video Summaries",
  description:
    "Turn YouTube into your unfair advantage. Get structured insights from any video in 30 seconds — no matter the length or language.",
  metadataBase: new URL("https://www.yt-brief.com"),
  verification: {
    google: "-hGKlm2jhrg-YcPDbM7wjowhXUorGhYHujU_KzgEWwE",
  },
  openGraph: {
    title: "YT-brief — Turn YouTube into your unfair advantage.",
    description:
      "The fastest way to extract insights from any video. 1 hr of content → 30 sec brief.",
    url: "https://yt-brief.com",
    siteName: "YT-brief",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YT-brief — Turn YouTube into your unfair advantage.",
    description:
      "The fastest way to extract insights from any video. 1 hr of content → 30 sec brief.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>
          {children}
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
