"use client";

import { Button } from "@cf/ui/components/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import primaryLogo from "@/assets/images/header-logo-primary.png";
import { mapErrorToLocaleKey } from "@/lib/utils/error-mapper";

interface ErrorComponentProps {
  /**
   * Error code to map to a specific message
   */
  errorCode?: string;
  
  /**
   * Custom title text (defaults to "Oops!")
   */
  title?: string;
  
  /**
   * Custom default message text (defaults to "Something went wrong. Please try again.")
   */
  defaultMessage?: string;
  
  /**
   * Whether to show the home button (defaults to true)
   */
  showHomeButton?: boolean;
  
  /**
   * Custom button text (defaults to "Go to Home")
   */
  buttonText?: string;
  
  /**
   * Custom button click handler (defaults to navigating home)
   */
  onButtonClick?: () => void;
  
  /**
   * Whether to show the logo (defaults to true)
   */
  showLogo?: boolean;
  
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Reusable error component for displaying consistent error messages across the application
 */
export function ErrorComponent({
  errorCode,
  title = "Oops!",
  defaultMessage = "Something went wrong. Please try again.",
  showHomeButton = true,
  buttonText = "Go to Home",
  onButtonClick,
  showLogo = true,
  className = "",
}: ErrorComponentProps) {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  
  // Map error code to locale key if provided
  const errorLocaleKey = errorCode ? mapErrorToLocaleKey(errorCode) : null;
  
  // Get translated message based on error code
  let errorMessage = defaultMessage;
  if (errorLocaleKey && errorLocaleKey !== errorCode) {
    // Parse the locale key to determine namespace and key
    const parts = errorLocaleKey.split('.');
    if (parts.length >= 2) {
      const namespace = parts[0];
      const key = parts.slice(1).join('.');
      
      try {
        if (namespace === 'common') {
          // Use raw translation function to avoid type issues
          const translationFunc = tCommon as (key: string) => string;
          errorMessage = translationFunc(key);
        } else if (namespace === 'auth') {
          // Use raw translation function to avoid type issues
          const translationFunc = tAuth as (key: string) => string;
          errorMessage = translationFunc(key);
        }
      } catch {
        // Fall back to default message if translation fails
        errorMessage = defaultMessage;
      }
    }
  }
  
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      router.push("/");
    }
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center text-center ${className}`}>
      {showLogo && (
        <Image src={primaryLogo} alt="Logo" className="mb-8" />
      )}
      
      <h1 className="text-6xl font-bold">{title}</h1>
      
      <p className="mt-4 text-lg">{errorMessage}</p>
      
      {showHomeButton && (
        <Button
          className="bg-primary mt-8 rounded-md px-8 py-3 font-bold text-white"
          onClick={handleButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}