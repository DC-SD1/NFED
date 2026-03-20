import { FileUpload } from "@/components/file-upload";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";

interface DocumentUploadSectionProps {
  title: string;
  formData: {
    primaryId: DocumentUploadResponse | null;
    secondaryId: DocumentUploadResponse | null;
    proofOfAddressDocument: DocumentUploadResponse | null;
    passportDocument: DocumentUploadResponse | null;
    visaDocument: DocumentUploadResponse | null;
  };
  uploadFunction: any;
  onUploadStart: (file: File) => void;
  onUploadSuccess: (fileId: string, data: DocumentUploadResponse) => void;
  onUploadError: (fileId: string, error: any) => void;
  onFileRemoved: (fileId: string) => void;
  documentKey:
    | "primaryId"
    | "secondaryId"
    | "proofOfAddressDocument"
    | "visaDocument"
    | "passportDocument";
}

export function DocumentUploadSection({
  title,
  formData,
  uploadFunction,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onFileRemoved,
  documentKey,
}: DocumentUploadSectionProps) {
  const document = formData[documentKey];

  return (
    <div className="space-y-4">
      <p className=" !mb-0 text-sm font-semibold">{title}</p>
      <FileUpload<DocumentUploadResponse>
        maxFiles={1}
        allowedTypes={["pdf", "jpg", "jpeg", "png"]}
        uploadFunction={uploadFunction}
        initialFiles={
          document
            ? [
                {
                  id: `${documentKey}-${Date.now()}`,
                  name: document.filename,
                  size: document.size,
                  type: document.type,
                  progress: 100,
                  status: "success" as const,
                  data: document,
                },
              ]
            : []
        }
        onUploadStart={onUploadStart}
        onUploadSuccess={onUploadSuccess}
        onUploadError={onUploadError}
        onFileRemoved={onFileRemoved}
        iconColor="text-primary"
        dropzoneProps={{
          title: "Upload",
          description:
            "Format accepted jpeg, png and PDF and file size max 2 MB",
        }}
      />
    </div>
  );
}
