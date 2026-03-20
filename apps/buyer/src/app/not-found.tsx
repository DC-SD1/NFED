"use client";

import { Button } from "@cf/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  // Client-side not-found page to avoid auth middleware issues
  // Next.js 404 pages don't have a specific route pattern that can be matched in middleware
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-6xl">🔍</div>

        <h1 className="text-destructive text-3xl font-bold">Page Not Found</h1>

        <p className="text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page might have been removed, renamed, or doesn&apos;t exist.
        </p>

        <div className="space-y-4">
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
