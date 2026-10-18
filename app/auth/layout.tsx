import type { Metadata, Viewport } from "next";

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
        {children}
      </body>
    </html>
  );
}
