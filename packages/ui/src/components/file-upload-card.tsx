"use client";

import { Check, Trash2, X } from "lucide-react";

import type { UploadFile } from "../hooks/use-file-upload";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../utils/cn";
import { truncateFileName } from "../utils/helper";
import { Button } from "./button";
import { Card } from "./card";
import { CircularProgress } from "./circular-progress";

interface FileUploadCardProps {
  className?: string;
  file: UploadFile;
  onDelete: () => void;
  onShowError: () => void;
}

export function FileUploadCard({
  className,
  file,
  onDelete,
  onShowError,
}: FileUploadCardProps) {
  const detectedIsMobile = useIsMobile();

  const maxNameLength = detectedIsMobile ? 30 : 45;
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

  const handleCardClick = () => {
    if (file.status === "error") {
      onShowError();
    }
  };

  return (
    <Card
      className={cn(
        "p-4 bg-white border-2 border-dashed transition-colors cursor-pointer",
        className,
        file.status === "error"
          ? "border-red-300 cursor-pointer hover:border-red-400"
          : "border-gray-300",
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-gray-900 text-sm truncate"
              title={file.name}
            >
              {truncateFileName(file.name, maxNameLength)}
            </p>
            <p className={`text-xs ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
