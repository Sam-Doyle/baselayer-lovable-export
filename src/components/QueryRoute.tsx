import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

/**
 * Loaded only by CMS-backed routes. Keeping this provider behind a route-level
 * lazy boundary prevents React Query and Sanity from joining the homepage's
 * initial dependency graph.
 */
const QueryRoute = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export default QueryRoute;
