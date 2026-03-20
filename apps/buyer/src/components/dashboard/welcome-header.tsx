"use client";

import { Skeleton } from "@cf/ui";
import * as React from "react";

import { useApiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface WelcomeHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function WelcomeHeader({
  title,
  subtitle = "See your overview summary",
  className,
}: WelcomeHeaderProps) {
  const api = useApiClient();

  const { data, isLoading } = api.useQuery("get", "/users/get-by-id");

  if (isLoading) {
    return (
      <div className={cn("", className)}>
        <Skeleton className="mb-2 h-8 w-56 bg-gray-200" />
        <Skeleton className="h-4 w-64 bg-gray-200" />
      </div>
    );
  }

  // Fallback for firstName
  const firstName = data?.firstName || "User";

  return (
    <div className={cn("", className)}>
      <h2 className="text-xl font-bold lg:text-2xl">
        {title || `Hi there, ${firstName}!`}
      </h2>
      <p className="text-sm lg:text-base">{subtitle}</p>
    </div>
  );
}
