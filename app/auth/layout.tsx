import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import StoreProvider from "../StoreProvider";

export const metadata: Metadata = {
  title: "বাকি খাতা",
  description: "ডিজিটাল বাকি খাতা ডেক্স সিস্টেম",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head></head>
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center">
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
