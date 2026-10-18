import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Hind_Siliguri,
  Newsreader,
  Plus_Jakarta_Sans,
  Geist_Mono,
} from "next/font/google";

import StoreProvider from "@/app/StoreProvider";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "বাকি খাতা — সহজ ও নির্ভরযোগ্য ডিজিটাল খাতা",
  description:
    "বাংলাদেশের মুদি দোকান, ফার্মেসি ও টেইলার্সের জন্য তৈরি সহজ ডিজিটাল লেজার।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${newsreader.variable} ${plusJakartaSans.variable} ${hindSiliguri.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#232523] selection:bg-forest-900 selection:text-white">
        <Suspense
          fallback={
            <main className="flex min-h-screen items-center justify-center text-sm text-foreground-muted">
              খাতা লোড হচ্ছে...
            </main>
          }
        >
          <StoreProvider>{children}</StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
