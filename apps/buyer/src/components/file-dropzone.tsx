"use client";

import { Card, cn } from "@cf/ui";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { CloudUpload, FileText, ImageIcon, Upload, Video } from "lucide-react";
import React from "react";
import {
  type DropzoneOptions,
  type FileRejection,
  useDropzone,
} from "react-dropzone";

export interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  onRejected?: (rejections: FileRejection[]) => void;
  accept?: DropzoneOptions["accept"];
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "compact" | "minimal";
  icon?:
  | "upload"
  | "cloud-upload"
  | "file"
  | "image"
  | "video"
  | "completed"
  | React.ReactElement;
  title?: string;
  description?: string;
  iconColor?: string;
}

export function FileDropzone({
  onFilesAdded,
  onRejected,
  accept,
  maxFiles = 1,
  maxSize,
  disabled = false,
  className = "",
  children,
  variant = "default",
  icon = "cloud-upload",
  title,
  description,
  iconColor,
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: (acceptedFiles, fileRejections) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
          onFilesAdded(acceptedFiles);
        }
        if (fileRejections && fileRejections.length > 0) {
          onRejected?.(fileRejections);
        }
      },
      accept,
      maxFiles,
      maxSize,
      disabled,
      multiple: maxFiles > 1,
    });

  const getIcon = () => {
    if (React.isValidElement(icon)) return icon;

    const iconClass = variant === "compact" ? "h-6 w-6" : "h-6 w-6";
    const iconProps = {
      className: `${iconClass} ${iconColor ?? "text-primary"} shrink-0`,
    };

    switch (icon) {
      case "file":
        return <FileText {...iconProps} />;
      case "image":
        return <ImageIcon {...iconProps} />;
      case "video":
        return <Video {...iconProps} />;
      case "upload":
        return <Upload {...iconProps} />;
      case "completed":
        return <IconCircleCheckFilled  {...iconProps} />
      case "cloud-upload":
      default:
        return <CloudUpload {...iconProps} />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return "p-4";
      case "minimal":
        return "p-2 border-dashed border-2";
      default:
        return "p-4";
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (variant) {
      case "compact":
        return "Drop files";
      case "minimal":
        return "Upload";
      default:
        return "Upload";
    }
  };

  const getDescription = () => {
    if (description) return description;
    if (variant === "minimal") return null;
    return "Format accepted .CSV (excel) and .KML";
  };

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "cursor-pointer border border-dashed border-[#6F7978] bg-white transition-colors",
        getVariantStyles(),
        className,
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-red-300 bg-red-50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input {...getInputProps()} />
      {children ?? (
        <div className="flex flex-row items-center gap-4">
          {getIcon()}
          <div className="flex flex-col items-start justify-center">
            <h3
              className={`text-primary font-semibold ${variant === "compact" ? "text-sm" : "text-sm"}`}
            >
              {getTitle()}
            </h3>
            {getDescription() && (
              <p
                className={`text-[#71786C] ${variant === "compact" ? "text-xs" : "text-xs"}`}
              >
                {getDescription()}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
