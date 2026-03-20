"use client";

import { Button } from "@cf/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@cf/ui/components/dialog";
import { Spinner } from "@cf/ui/icons";
import Image from "next/image";
import { useRef } from "react";

interface ProfileCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imagePreview: string | null;
  cropPosition: { x: number; y: number };
  zoom: number;
  dragging: boolean;
  isUploading: boolean;
  uploadProgress: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onSaveAndUpload: () => void;
  onUploadDifferent: () => void;
  onCancel: () => void;
}

export function ProfileCropModal({
  open,
  onOpenChange,
  imagePreview,
  cropPosition,
  zoom,
  dragging,
  isUploading,
  uploadProgress,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onSaveAndUpload,
  onUploadDifferent,
  onCancel,
}: ProfileCropModalProps) {
  const cropContainerRef = useRef<HTMLDivElement>(null);

  const CONTAINER_WIDTH = 250;
  const CONTAINER_HEIGHT = 190;
  const CROP_OVERLAY_SIZE = 300;
  const CROP_RADIUS = 95;
  const GRADIENT_FADE_START = CROP_RADIUS + 25;
  const GRADIENT_FADE_END = CROP_RADIUS + 85;
  const CROP_CENTER = CROP_OVERLAY_SIZE / 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-h-[490px] sm:max-w-[416px]">
        <DialogHeader>
          <DialogTitle className="not-sr-only text-center text-xl font-semibold">
            Edit Portrait
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Crop Container */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            ref={cropContainerRef}
            className="relative mx-auto h-[190px] w-[250px] overflow-hidden rounded-lg bg-black"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Image */}
            {imagePreview && (
              <Image
                width={CONTAINER_WIDTH}
                height={CONTAINER_HEIGHT}
                src={imagePreview}
                alt="Preview"
                className="h-full w-full object-cover"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />
            )}

            {/* Black Overlay with Radial Gradient Fade */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${cropPosition.x + CROP_CENTER}px ${cropPosition.y + CROP_CENTER}px, transparent ${CROP_RADIUS}px, rgba(0, 0, 0, 0.4) ${GRADIENT_FADE_START}px, rgba(0, 0, 0, 0.75) ${GRADIENT_FADE_END}px)`,
              }}
            />

            {/* Circular Crop Overlay */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className="absolute"
              style={{
                top: cropPosition.y,
                left: cropPosition.x,
                width: `${CROP_OVERLAY_SIZE}px`,
                height: `${CROP_OVERLAY_SIZE}px`,
                cursor: dragging ? "grabbing" : "grab",
              }}
              onMouseDown={onMouseDown}
            >
              {/* Crop circle with dashed border */}
              <div className="relative h-full w-full">
                <svg className="h-full w-full">
                  <circle
                    cx={CROP_CENTER}
                    cy={CROP_CENTER}
                    r={CROP_RADIUS}
                    fill="transparent"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-gray-dark">
            Drag frame to adjust portrait
          </p>

          {/* Upload Different Photo Link */}
          <button
            type="button"
            className="mx-auto block text-sm font-medium text-primary"
            onClick={onUploadDifferent}
          >
            Upload a different photo
          </button>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 pt-3">
            <Button
              onClick={onSaveAndUpload}
              disabled={isUploading}
              className="h-[48px] w-[250px] bg-primary hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                "Save and upload"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isUploading}
              className="h-[48px] w-[250px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
