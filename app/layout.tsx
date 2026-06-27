import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AyeKarp! — Cognitive Stream",
  description: "Capture, organize, and synthesize your cognitive stream.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
