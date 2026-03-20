"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStoreContext } from "@/lib/stores/auth-store-ssr";
import { getRoleBasedDestination } from "@/lib/utils/navigation";

interface AuthenticatedRedirectProps {
  locale: string;
  roles?: string[];
}

export function AuthenticatedRedirect({
  locale,
  roles = [],
}: AuthenticatedRedirectProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const isTokenExchangeHandled = useAuthStoreContext(
    (state: { isTokenExchangeHandled: boolean }) =>
      state.isTokenExchangeHandled,
  );

  useEffect(() => {
    // Wait for both Clerk auth to load AND token exchange to complete
    if (isLoaded && isSignedIn && isTokenExchangeHandled) {
      const destination = getRoleBasedDestination(roles, locale);
      router.push(destination);
    }
  }, [isLoaded, isSignedIn, isTokenExchangeHandled, roles, locale, router]);

  // Show loading state while auth is initializing
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
}
