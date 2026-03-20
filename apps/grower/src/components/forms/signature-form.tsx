"use client";
/* eslint-disable max-lines-per-function */
import type { UploadFile } from "@cf/ui";
import { Button } from "@cf/ui";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { parseAsStringEnum, useQueryState } from "nuqs";
import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { logger } from "@/lib/utils/logger";
import { showErrorToast } from "@/lib/utils/toast";

import { SignatureUpload } from "../large-file-upload";

// FIXED: Modern, robust way to convert DataURL to Blob using native browser API
async function dataURLtoBlob(dataURL: string): Promise<Blob> {
  const res = await fetch(dataURL);
  return await res.blob();
}

interface Props {
  contractId?: string;
}

export default function SignatureForm({ contractId }: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const authUser = useAuthUser();

  // Hydration check to prevent layout shift issues with Canvas
  const [mounted, setMounted] = useState(false);

  const t = useTranslations("dashboard.grow.signing");
  const api = useApiClient();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringEnum(["draw", "upload"]).withDefault("draw"),
  );
  const [_signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 680, height: 300 });
  const router = useRouter();

  const { mutate: updateSignatureMutation, isPending: updateSignatureLoading } =
    api.useMutation("put", "/contracts/{ContractId}/signature", {
      onSuccess: () => {
        router.push("/farm-owner/farm-grow/success");
      },
      onError: (error) => {
        logger.error("Failed to update signature", error, {
          contractId,
        });
        showErrorToast("Failed to update signature. Please try again.");
      },
    });

  const { mutate: uploadSignatureMutation, isPending: uploadSignatureLoading } =
    api.useMutation("post", "/upload/contract-documents", {
      onSuccess: (data) => {
        updateSignatureMutation({
          params: { path: { ContractId: contractId ?? "" } },
          body: { signatureImageUrl: data },
        });
      },
      onError: (error) => {
        logger.error("Failed to upload signature", error, {
          contractId,
          userId: authUser.userId,
        });
        showErrorToast("Failed to upload signature. Please try again.");
        setSignatureConfirmed(false);
      },
    });

  useEffect(() => {
    setMounted(true);
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Ensure we don't get a 0 width during initial render
        if (containerWidth === 0) return;

        const availableWidth = Math.max(300, containerWidth - 40);
        const width = Math.min(680, availableWidth);
        const height = Math.max(200, Math.min(300, width * 0.44));
        setCanvasSize({ width, height });
      }
    };

    // Small delay to ensure parent container has painted in production
    const timer = setTimeout(updateCanvasSize, 100);
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      clearTimeout(timer);
    };
  }, []);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setHasDrawnSignature(false);
  };

  // Updated to be async because dataURLtoBlob is now async
  const confirmSignature = async () => {
    if (sigCanvas.current?.isEmpty() && uploadedFiles.length === 0) {
      showErrorToast("Please provide a signature before confirming.");
      return;
    }

    setSignatureConfirmed(true);

    // Prioritize based on the active tab
    if (
      activeTab === "draw" &&
      sigCanvas.current &&
      !sigCanvas.current.isEmpty()
    ) {
      try {
        let dataURL: string | null = null;

        // FIXED: Try trimmed canvas first, fall back to full canvas if it fails
        try {
          const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
          dataURL = trimmedCanvas.toDataURL("image/png");
        } catch (trimError) {
          // logger.warn("Trimmed canvas failed, using full canvas", trimError );
          // Fallback to standard canvas
          const canvas = sigCanvas.current.getCanvas();
          dataURL = canvas.toDataURL("image/png");
        }

        if (!dataURL || dataURL === "data:,") {
          throw new Error("Failed to generate image data from canvas");
        }

        // FIXED: Use the new Async blob converter
        const blob = await dataURLtoBlob(dataURL);

        if (!blob || blob.size === 0) {
          throw new Error("Failed to create blob from signature data");
        }

        const file = new File([blob], "signature.png", { type: "image/png" });

        uploadSignatureMutation({
          body: {
            file: file as any,
            userId: authUser.userId ?? "",
            contractId: contractId,
          },
          bodySerializer(body) {
            const fd = new FormData();
            for (const name in body) {
              fd.append(name, (body as any)[name]);
            }
            return fd;
          },
        });
      } catch (error) {
        logger.error("Failed to process signature canvas", error, {
          activeTab,
          hasCanvas: !!sigCanvas.current,
          isEmpty: sigCanvas.current?.isEmpty(),
        });
        showErrorToast(
          "Failed to process signature. Please try drawing again or upload an image.",
        );
        setSignatureConfirmed(false);
      }
    } else if (
      activeTab === "upload" &&
      uploadedFiles.length > 0 &&
      uploadedFiles?.[0]?.originalFile
    ) {
      uploadSignatureMutation({
        body: {
          file: uploadedFiles[0].originalFile as any,
          userId: authUser.userId ?? "",
          contractId: contractId,
        },
        bodySerializer(body) {
          const fd = new FormData();
          for (const name in body) {
            fd.append(name, (body as any)[name]);
          }
          return fd;
        },
      });
    }
  };

  const cancelSignature = () => {
    setSignatureConfirmed(false);
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setUploadedFiles([]);
    setHasDrawnSignature(false);
  };

  const handleFilesAdded = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const newFileId = Date.now().toString();

    const uploadFile: UploadFile = {
      id: newFileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
      originalFile: file,
    };

    setUploadedFiles([uploadFile]);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result || !sigCanvas.current) return;

      const img = new Image();
      img.onload = () => {
        if (!sigCanvas.current) return;

        const canvas = sigCanvas.current.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        setUploadedFiles((currentFiles) =>
          currentFiles.map((f) =>
            f.id === newFileId ? { ...f, status: "success", progress: 100 } : f,
          ),
        );
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles((files) => files.filter((f) => f.id !== fileId));
    clearSignature();
  };

  const handleFileRetry = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file?.originalFile) {
      handleFilesAdded([file.originalFile]);
    }
  };

  const handleShowError = (file: UploadFile) => {
    showErrorToast(
      `Error uploading ${file.name}: ${file.errorMessage || "Unknown error"}`,
    );
  };

  const hasUploadedFiles = uploadedFiles.length > 0;

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl ">
      <div className="mb-6 flex items-center justify-center gap-4">
        <Button
          onClick={() => {
            void setActiveTab("draw");
            setHasDrawnSignature(false);
          }}
          variant="unstyled"
          className={`rounded-lg px-6 font-medium transition-colors sm:px-6 sm:text-base ${
            activeTab === "draw"
              ? "bg-primary text-white"
              : "border border-input-border bg-transparent text-gray-dark"
          }`}
        >
          {t("draw")}
        </Button>
        <Button
          onClick={() => {
            void setActiveTab("upload");
            setHasDrawnSignature(false);
          }}
          variant="unstyled"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:px-6 sm:text-base ${
            activeTab === "upload"
              ? "bg-primary text-white"
              : "border border-input-border bg-transparent text-gray-dark"
          }`}
        >
          {t("upload")}
        </Button>
      </div>
      <div className="mb-4 text-center">
        <p className="text-md font-thin">
          {activeTab === "draw" ? (
            t("instruction")
          ) : (
            <span className="invisible">.</span>
          )}
        </p>
      </div>
      <div className="mx-auto w-full max-w-2xl justify-center">
        {/* Only render Canvas when mounted to ensure correct size calculation */}
        {mounted && activeTab === "draw" && (
          <div className="relative mb-6 max-w-2xl overflow-hidden rounded-lg border-2 border-dashed border-gray-dark bg-gray-light">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className: "w-full max-w-full block",
                style: { touchAction: "none" },
              }}
              onEnd={() => setHasDrawnSignature(true)}
            />
            <Button
              onClick={clearSignature}
              variant="unstyled"
              className="absolute bottom-2 left-2 p-1 text-xs font-semibold text-gray-600 hover:text-gray-800 sm:left-4 sm:text-sm"
            >
              {t("clear")}
            </Button>
          </div>
        )}

        {mounted && activeTab === "upload" && hasUploadedFiles && (
          <div className="relative mb-6 overflow-hidden rounded-lg border-2 border-dashed border-gray-dark bg-gray-light">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className: "w-full max-w-full block pointer-events-none",
              }}
            />
          </div>
        )}

        {activeTab === "upload" && !hasUploadedFiles && (
          <div className="w-full">
            <SignatureUpload
              onFilesAdded={handleFilesAdded}
              onFileRemove={handleFileRemove}
              onFileRetry={handleFileRetry}
              onShowError={handleShowError}
              files={uploadedFiles}
              maxFiles={1}
              maxSize={2 * 1024 * 1024}
              title={
                isMobile
                  ? "Upload a signature image"
                  : "Drag & drop a signature image"
              }
              subtitle="Format accepted: PNG"
              buttonText="Select image"
              showFileCards={true}
            />
          </div>
        )}

        {hasUploadedFiles && (
          <div className="mb-6">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="break-all text-sm font-medium sm:break-normal">
                  {file.name}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFileRemove(file.id)}
                    variant="unstyled"
                    className="text-sm text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agreement Text */}
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-dark">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="!w-4xl items-center space-y-3 text-center">
        <Button
          onClick={confirmSignature}
          disabled={
            (!hasDrawnSignature && uploadedFiles.length === 0) ||
            updateSignatureLoading ||
            uploadSignatureLoading
          }
          className="w-full rounded-xl sm:w-3/4"
        >
          {t("confirm")}
        </Button>

        <Button
          variant="unstyled"
          onClick={cancelSignature}
          className="w-full py-2 font-medium"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
