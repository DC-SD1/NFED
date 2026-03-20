"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@cf/ui/components/dialog";
import { FileDropzone } from "@cf/ui/components/file-dropzone";
import { CloudUpload } from "lucide-react";

interface ProfileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesAdded: (files: File[]) => void;
}

export function ProfileUploadModal({
  open,
  onOpenChange,
  onFilesAdded,
}: ProfileUploadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="not-sr-only text-center text-xl font-semibold">
            Add profile image
          </DialogTitle>
          <DialogDescription className="text-gray-dark text-md text-center">
            Upload a photo that was taken in a well lit environment, avoid photo
            that is digitally altered
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="mb-2 block text-sm font-medium">Upload photo</p>

            <FileDropzone
              onFilesAdded={onFilesAdded}
              accept={{ "image/*": [".jpg", ".jpeg", ".png", ".gif"] }}
              maxFiles={1}
              maxSize={5 * 1024 * 1024} // 5MB
              iconColor="#36B92E"
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 rounded-full p-3">
                  <CloudUpload className="text-primary size-6" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-[#36B92E]">Upload</p>
                  <p className="text-gray-dark">
                    Click here to{" "}
                    <span className="text-primary underline">upload photo</span>{" "}
                    Or drag the photo here
                  </p>
                </div>
              </div>
            </FileDropzone>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
