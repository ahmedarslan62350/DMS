import { QueryClient } from "@tanstack/react-query";

/**
 * A single client for the whole app.
 *
 * The previous implementation constructed a `new QueryClient()` inside the
 * root layout body, so every render produced a fresh cache and in-flight
 * queries were discarded. Hoisting it to module scope fixes that.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
