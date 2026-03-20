import { Dialog, DialogClose, DialogContent } from "@cf/ui";
import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

interface DocumentViewProps {
  documentUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentView({
  documentUrl,
  isOpen,
  onClose,
}: DocumentViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!documentUrl) return null;

  const isPdf = documentUrl.toLowerCase().includes(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(documentUrl);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-screen w-screen max-w-none p-0">
        <div className="relative size-full">
          <DialogClose asChild>
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <IconX className="size-6" />
            </button>
          </DialogClose>

          <div className="flex size-full items-center justify-center bg-black">
            {isPdf ? (
              <iframe
                src={documentUrl}
                className="size-full"
                onLoad={handleLoad}
                onError={handleError}
                title="PDF Viewer"
              />
            ) : isImage ? (
              <Image
                src={documentUrl}
                alt="Document"
                width={800}
                height={600}
                className="max-h-full max-w-full object-contain"
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : (
              <div className="text-white">
                Unsupported file type. Please download the file to view it.
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white">Loading...</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
