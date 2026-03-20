"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Check, Edit, FileText, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { FileUpload } from "@/components/file-upload";
import { useKycDocumentUpload } from "@/hooks/use-kyc-document-upload";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";

interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "jpg" | "jpeg" | "png";
  size: number; // in bytes
  maxSize: number; // in bytes
}

interface KycDocumentsCardProps {
  documents?: DocumentItem[];
  onEdit?: () => void;
  onDelete?: (documentId: string) => void;
  onDocumentsUpdate?: (documents: DocumentItem[]) => void;
}

const KycDocumentsCard = ({
  documents = [
    {
      id: "1",
      name: "Kwesi Danso iD.jpeg",
      type: "jpg",
      size: 665600, // 650 KB
      maxSize: 2097152, // 2 MB
    },
    {
      id: "2",
      name: "Utility bill.jpeg",
      type: "pdf",
      size: 1363148, // 1.3 MB
      maxSize: 2097152, // 2 MB
    },
  ],
  onEdit,
  onDelete,
  onDocumentsUpdate,
}: KycDocumentsCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState(documents);
  const { uploadFunction } = useKycDocumentUpload();

  useEffect(() => {
    onDocumentsUpdate?.(currentDocuments);
  }, [currentDocuments, onDocumentsUpdate]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentDocuments(documents);
  };

  const handleSave = () => {
    setIsEditing(false);
    onDocumentsUpdate?.(currentDocuments);
  };

  const handleUploadSuccess = (
    fileId: string,
    data: DocumentUploadResponse,
  ) => {
    const fileExtension =
      data.filename?.split(".").pop()?.toLowerCase() || "pdf";
    const newDoc: DocumentItem = {
      id: data.id || fileId,
      name: data.filename || "Uploaded document",
      type: (["pdf", "jpg", "jpeg", "png"].includes(fileExtension)
        ? fileExtension
        : "pdf") as "pdf" | "jpg" | "jpeg" | "png",
      size: data.size || 0,
      maxSize: 2097152, // 2 MB default
    };
    setCurrentDocuments([...currentDocuments, newDoc]);
  };

  const handleDeleteDocument = (documentId: string) => {
    setCurrentDocuments(
      currentDocuments.filter((doc) => doc.id !== documentId),
    );
    onDelete?.(documentId);
  };

  const getFileIcon = (type: string) => {
    const iconClass = "size-8";
    switch (type.toLowerCase()) {
      case "pdf":
        return (
          <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100">
            <div className="flex flex-col items-center">
              <FileText className={iconClass} />
              <span className="text-[10px] font-bold">PDF</span>
            </div>
          </div>
        );
      case "jpg":
      case "jpeg":
        return (
          <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100">
            <div className="flex flex-col items-center">
              <FileText className={iconClass} />
              <span className="text-[10px] font-bold">JPG</span>
            </div>
          </div>
        );
      case "png":
        return (
          <div className="flex size-12 items-center justify-center rounded-lg bg-gray-100">
            <div className="flex flex-col items-center">
              <FileText className={iconClass} />
              <span className="text-[10px] font-bold">PNG</span>
            </div>
          </div>
        );
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <Card className="w-[630px] rounded-[24px] border-none bg-white p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold">KYC Documents</h2>
          {!isEditing ? (
            <Button
              variant="unstyled"
              size="sm"
              className="flex items-center gap-1 p-0 text-primary"
              onClick={handleEdit}
            >
              <Edit className="size-4" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="unstyled"
                size="sm"
                className="flex items-center gap-2 p-0 text-base font-medium text-[#22C55E] hover:text-[#22C55E]/80"
                onClick={handleSave}
              >
                <Check className="size-4" />
                Save
              </Button>
              <Button
                variant="unstyled"
                size="sm"
                className="flex items-center gap-2 p-0 text-base font-medium text-[#22C55E] hover:text-[#22C55E]/80"
                onClick={handleCancel}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600">Your account is compliant</p>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        {currentDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-center gap-4">
              {getFileIcon(doc.type)}
              <div className="flex flex-col">
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(doc.size)}/{formatFileSize(doc.maxSize)}
                </p>
              </div>
            </div>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="size-10 rounded-full p-0 hover:bg-gray-200"
                onClick={() => handleDeleteDocument(doc.id)}
              >
                <Trash2 className="size-5 text-gray-dark" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4">
            <FileUpload
              maxFiles={5}
              maxSize={10485760} // 10 MB (matching the uploadFunction limit)
              allowedTypes={["pdf", "jpg", "jpeg", "png"]}
              showDropzoneWhenHasFiles={true}
              uploadFunction={uploadFunction}
              onUploadSuccess={handleUploadSuccess}
              dropzoneProps={{
                title: "Upload KYC Documents",
                description:
                  "Drag & drop your documents here or click to browse (PDF, JPG, PNG, max 10MB)",
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KycDocumentsCard;
