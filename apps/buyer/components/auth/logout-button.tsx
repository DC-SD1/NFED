"use client";

import { Button } from "@cf/ui/components/button";
import { useAuth } from "@clerk/nextjs";
import { Loader2, LogOut } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthActions } from "@/lib/stores/auth/auth-store-ssr";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Logout button component that handles the complete logout flow
 */
export function LogoutButton({
  variant = "outline",
  size = "default",
  className,
  children,
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : "en";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout(signOut, router, locale);
    } catch (error) {
      // Error handling is done in the logout function
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 size-4" />
          {children || "Sign out"}
        </>
      )}
    </Button>
  );
}
