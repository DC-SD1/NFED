"use client";

import { ProgressProvider as BProgressProvider } from "@bprogress/next/app";

const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <BProgressProvider
      height="4px"
      color="#4B908B"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </BProgressProvider>
  );
};

export default ProgressProvider;
