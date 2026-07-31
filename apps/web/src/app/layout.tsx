import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "ArcHive | Engineering Intelligence Platform",
  description:
    "Engineering intelligence and architecture memory for GitHub repositories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>

        <Toaster
          richColors
          position="top-right"
          duration={5000}
        />
      </body>
    </html>
  );
}