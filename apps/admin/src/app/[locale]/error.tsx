"use client";

import { Button } from "@cf/ui/components/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-6xl">⚠️</div>

        <h1 className="text-destructive text-3xl font-bold">
          {t("errors.error.title")}
        </h1>

        <p className="text-muted-foreground">
          {t("errors.error.message")}
        </p>

        <div className="space-y-4">
          <Button onClick={() => reset()}>
            {t("errors.error.tryAgain")}
          </Button>

          <div>
            <Button variant="outline" asChild>
              <a href="/">
                {t("errors.error.goToHome")}
              </a>
            </Button>
          </div>
        </div>

        {error.digest && (
          <p className="text-muted-foreground text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}