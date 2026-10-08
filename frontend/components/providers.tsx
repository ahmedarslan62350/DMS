"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "./theme-provider";

/**
 * All client-side context lives behind this one boundary.
 *
 * The root layout is a Server Component, so it cannot hand a `QueryClient`
 * instance (a class) straight to a client provider — React refuses to
 * serialise it. Constructing and owning the client here keeps the layout
 * server-rendered while still giving the tree a stable cache.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
