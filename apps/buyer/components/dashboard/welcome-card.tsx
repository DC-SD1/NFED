import { Card, CardContent } from "@cf/ui";
import * as React from "react";

import { cn } from "@/lib/utils";

interface WelcomeCardProps {
  userName?: string;
  title?: string;
  subtitle?: string;
  supportInfo?: {
    text: string;
    phone: string;
  };
  className?: string;
}

export function WelcomeCard({
  userName,
  title,
  subtitle,
  supportInfo,
  className,
}: WelcomeCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <h2 className="mb-2 text-xl font-semibold">
          {title || `Welcome ${userName || "back"}`}
        </h2>

        {subtitle && (
          <p className="text-muted-foreground mb-4 text-sm">{subtitle}</p>
        )}

        {supportInfo && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">{supportInfo.text}</p>
            <p className="text-primary font-medium">
              Contact support: {supportInfo.phone}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
