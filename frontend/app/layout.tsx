"use client"

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// export const metadata: Metadata = {
//   title: "DialerFlow | Management Portal",
//   description: "Premium SaaS dashboard for dialer management.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = new QueryClient();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <QueryClientProvider client={client}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
