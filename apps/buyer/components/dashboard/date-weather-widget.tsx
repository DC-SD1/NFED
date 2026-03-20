import { Calendar, Cloud, CloudRain, Sun } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface DateWeatherWidgetProps {
  date?: Date;
  weather?: {
    temperature: number;
    condition: "sunny" | "cloudy" | "rainy";
  };
  className?: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
};

export function DateWeatherWidget({
  date = new Date(),
  weather,
  className,
}: DateWeatherWidgetProps) {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const WeatherIcon = weather ? weatherIcons[weather.condition] : Sun;

  return (
    <div
      className={cn(
        "bg-muted/50 flex items-center gap-4 rounded-lg px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Calendar className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">{formattedDate}</span>
      </div>

      {weather && (
        <>
          <div className="bg-border h-4 w-px" />
          <div className="flex items-center gap-2">
            <WeatherIcon className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">{weather.temperature}°</span>
          </div>
        </>
      )}
    </div>
  );
}
