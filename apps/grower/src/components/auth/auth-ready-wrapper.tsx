"use client";

import { useAuth } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { useAuthStoreContext } from "@/lib/stores/auth-store-ssr";

interface AuthReadyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthReadyWrapper({
  children,
  fallback,
}: AuthReadyWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const isTokenExchangeHandled = useAuthStoreContext(
    (state: { isTokenExchangeHandled: boolean }) =>
      state.isTokenExchangeHandled,
  );

  // If Clerk is still loading, show fallback
  if (!isLoaded) {
    return (
      <>
        {fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // If user is signed in but token exchange hasn't completed, show fallback
  if (isSignedIn && !isTokenExchangeHandled) {
    return (
      <>
        {fallback || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground">Authenticating...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Auth is ready (either signed out or signed in with token exchanged)
  return <>{children}</>;
}
