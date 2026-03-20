"use client";

import { Badge, Button } from "@cf/ui";
import { FlaskConical, X } from "lucide-react";

interface MockDataToggleProps {
  enabled: boolean;
  onToggle: () => void;
  showBadgeOnly?: boolean;
}

export function MockDataToggle({
  enabled,
  onToggle,
  showBadgeOnly = false,
}: MockDataToggleProps) {
  if (process.env.NODE_ENV !== "development") return null;

  if (showBadgeOnly && enabled) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 bg-amber-50 text-amber-700"
      >
        <FlaskConical className="mr-1.5 size-3" />
        Mock Data Mode
      </Badge>
    );
  }

  if (showBadgeOnly && !enabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {!enabled && (
        <div className="max-w-xs rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-md">
          <p className="font-medium">💡 API Not Ready?</p>
          <p className="mt-1">
            Enable mock data to preview and test the buyer listing interface.
          </p>
        </div>
      )}
      {enabled ? (
        <Badge
          className="cursor-pointer border-amber-500 bg-amber-500 px-3 py-2 text-white shadow-lg transition-all hover:bg-amber-600"
          onClick={onToggle}
        >
          <FlaskConical className="mr-2 size-4" />
          Mock Data: ON
          <X className="ml-2 size-4" />
        </Badge>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={onToggle}
          className="border-amber-500 text-amber-700 shadow-lg hover:bg-amber-50 hover:text-amber-700"
        >
          <FlaskConical className="mr-2 size-4" />
          Enable Mock Data
        </Button>
      )}
    </div>
  );
}
