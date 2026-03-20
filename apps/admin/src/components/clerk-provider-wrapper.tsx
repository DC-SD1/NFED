"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { AuthStoreProvider } from "@/lib/stores/auth/auth-store-ssr";

import { SimplifiedAuthWrapper } from "./simplified-auth-wrapper";

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Extract locale from pathname (e.g., /en/some-path -> en)
  const locale = pathname.split("/")[1] || "en";

  return (
    <ClerkProvider
      dynamic
      signInUrl={`/${locale}`}
      afterSignOutUrl={`/${locale}`}
    >
      <AuthStoreProvider>
        <SimplifiedAuthWrapper>{children}</SimplifiedAuthWrapper>
      </AuthStoreProvider>
    </ClerkProvider>
  );
}
