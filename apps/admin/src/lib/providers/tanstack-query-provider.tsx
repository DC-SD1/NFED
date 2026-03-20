"use client";
import {
  type DefaultOptions,
  QueryClientProvider,
} from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useState } from "react";

// Options
const queryClientOptions = {
  defaultOptions: {
    // 5 * 1000
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      // staleTime: 1000 * 60 * 1, // 1 minute
    },
  } satisfies DefaultOptions,
};

const TanstackQueryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // State
  const [queryClientStore] = useState(
    () => new QueryClient(queryClientOptions),
  );
  // Return Provider
  return (
    <QueryClientProvider client={queryClientStore}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> */}
    </QueryClientProvider>
  );
};

export default TanstackQueryProvider;
