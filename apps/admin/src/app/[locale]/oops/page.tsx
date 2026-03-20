"use client";

import { useSearchParams } from "next/navigation";

import { ErrorComponent } from "@/components/error-component";

export default function OopsPage() {
  const searchParams = useSearchParams();
  
  // Get error code from URL parameters
  const errorCode = searchParams.get("code") || undefined;

  return <ErrorComponent errorCode={errorCode} />;
}
