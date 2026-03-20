import * as React from "react";
import { Suspense } from "react";

import { getWeatherData } from "@/lib/utils/weather-data";

import WelcomeCardSkeleton from "./skeletons/welcome-card-skeleton";
import WelcomeCardClient from "./welcome-card.client";

interface WelcomeCardProps {
  showProgress?: boolean;
  className?: string;
}

export default async function WelcomeCard({
  showProgress,
  className,
}: WelcomeCardProps) {
  const weatherData = await getWeatherData();

  return (
    <Suspense fallback={<WelcomeCardSkeleton />}>
      <WelcomeCardClient
        showProgress={showProgress}
        className={className}
        {...weatherData}
        stepsComplete={0}
      />
    </Suspense>
  );
}
