"use client";

import { AlertCircle, Check, RotateCcw, Trash2, X } from "lucide-react";

import type { UploadFile } from "../hooks/use-file-upload";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../utils/cn";
import { truncateFileName } from "../utils/helper";
import { Button } from "./button";
import { Card } from "./card";
import { CircularProgress } from "./circular-progress";

export interface FileCardProps {
  file: UploadFile;
  onRemove?: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
  onShowError?: (file: UploadFile) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
  isMobile?: boolean;
  isDesktop?: boolean;
}

export function FileCard({
  file,
  onRemove,
  onRetry,
  onShowError,
  showActions = true,
  compact = false,
  className = "",
  isMobile: propIsMobile,
  // eslint-disable-next-line unused-imports/no-unused-vars
  isDesktop = false,
}: FileCardProps) {
  const detectedIsMobile = useIsMobile();

  // Use props if provided, otherwise use hook detection
  const isMobile = propIsMobile ?? detectedIsMobile;

  // Adjust truncation length based on device
  const maxNameLength = isMobile ? 30 : 45;

  const getStatusIcon = () => {
    switch (file.status) {
      case "success":
        return (
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        );
      case "error":
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <X className="h-4 w-4 text-white" />
          </div>
        );
      case "uploading":
        return (
          <CircularProgress
            progress={file.progress}
            size={24}
            strokeWidth={2}
          />
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        );
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case "uploading":
        return `Uploading...${file.progress}%`;
      case "success":
        return "Done";
      case "error":
        return "Failed to upload";
      default:
        return "Ready to upload";
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "uploading":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleCardClick = () => {
    if (file.status === "error" && onShowError) {
      onShowError(file);
    }
  };

  return (
    <Card
      className={cn(
        "bg-white border-2 border-dashed transition-colors",
        className,
        file.status === "error"
          ? "border-red-300 cursor-pointer hover:border-red-400"
          : "border-gray-300",
        compact ? "p-3" : "p-4",
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-3 flex-1 min-w-0 overflow-hidden">
          {getStatusIcon()}
          <div className="flex-1 min-w-0 overflow-hidden">
            <p
              className={`font-medium text-gray-900 truncate ${compact ? "text-sm" : "text-sm"}`}
              title={file.name}
            >
              {truncateFileName(file.name, maxNameLength)}
            </p>
            <div className="flex items-center space-x-2">
              <p
                className={`${compact ? "text-xs" : "text-xs"} ${getStatusColor()}`}
              >
                {getStatusText()}
              </p>
              {!compact && (
                <span className="text-xs text-gray-400">
                  • {formatFileSize(file.size)}
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            {file.status === "error" && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(file.id);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                title="Retry upload"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {file.status === "error" && onShowError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowError(file);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                title="Show error details"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file.id);
                }}
                className="bg-primary-light relative rounded-full"
                title="Remove file"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
