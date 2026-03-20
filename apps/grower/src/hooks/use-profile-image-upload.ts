"use client";

import { useState } from "react";

import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { getCroppedImage } from "../components/dashboard/wallet-transaction-cards/personal-details-utils";

interface UseProfileImageUploadProps {
  onSuccess?: () => void;
}

export function useProfileImageUpload({
  onSuccess,
}: UseProfileImageUploadProps = {}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFilesAdded = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setShowUploadModal(false);
      setShowCropModal(true);
      setCropPosition({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setCropPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleSaveAndUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    const croppedBlob = await getCroppedImage(imagePreview, cropPosition, zoom);
    if (!croppedBlob) {
      showErrorToast("Failed to crop image");
      setIsUploading(false);
      return;
    }

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          showSuccessToast("Profile image uploaded successfully!");
          onSuccess?.();
          setTimeout(() => {
            setShowCropModal(false);
            setSelectedFile(null);
            setImagePreview(null);
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleUploadDifferent = () => {
    setShowCropModal(false);
    setImagePreview(null);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleCancel = () => {
    setShowCropModal(false);
    setImagePreview(null);
    setSelectedFile(null);
    setCropPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  const resetState = () => {
    setShowUploadModal(false);
    setShowCropModal(false);
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setCropPosition({ x: 0, y: 0 });
    setZoom(1);
    setDragging(false);
    setDragStart({ x: 0, y: 0 });
  };

  return {
    showUploadModal,
    setShowUploadModal,
    showCropModal,
    setShowCropModal,
    selectedFile,
    imagePreview,
    uploadProgress,
    isUploading,
    cropPosition,
    setCropPosition,
    zoom,
    setZoom,
    dragging,
    handleFilesAdded,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSaveAndUpload,
    handleUploadDifferent,
    handleCancel,
    resetState,
  };
}
