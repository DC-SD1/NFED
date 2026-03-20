"use client";

import { Button } from "@cf/ui/components/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-6xl">⚠️</div>

        <h1 className="text-destructive text-3xl font-bold">
          Something went wrong!
        </h1>

        <p className="text-muted-foreground">
          We&apos;re sorry, but something unexpected happened. Please try again
          or contact support if the problem persists.
        </p>

        <div className="space-y-4">
          <Button onClick={() => reset()}>Try again</Button>

          <div>
            <Button variant="outline" asChild>
              <a href="/">Go to Home</a>
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
