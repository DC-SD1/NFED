import { FormInput } from "@cf/ui";
import { RadioGroup, RadioGroupItem } from "@cf/ui/components/radio-group";

import { FileUpload } from "@/components/file-upload";
import type { DocumentUploadResponse } from "@/lib/stores/upload-store";
import { handlePostCodeInput } from "@/lib/utils/string-helpers";

interface ProofOfAddressSectionProps {
  formData: {
    proofOfAddressType:
      | "ghana_post_code"
      | "utility_bill"
      | "bank_statement"
      | null;
    ghanaPostCode: string;
    proofOfAddressDocument: DocumentUploadResponse | null;
  };
  uploadFunction: any;
  onProofTypeChange: (
    type: "ghana_post_code" | "utility_bill" | "bank_statement",
  ) => void;
  onUploadStart: (file: File) => void;
  onUploadSuccess: (fileId: string, data: DocumentUploadResponse) => void;
  onUploadError: (fileId: string, error: any) => void;
  onFileRemoved: (fileId: string) => void;
  hideRadioGroup?: boolean;
}

export function ProofOfAddressSection({
  formData,
  uploadFunction,
  onProofTypeChange,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onFileRemoved,
  hideRadioGroup = false,
}: ProofOfAddressSectionProps) {
  const proofTypeOptions = [
    { value: "ghana_post_code", label: "Ghana post code" },
    { value: "utility_bill", label: "Utility bill" },
    { value: "bank_statement", label: "Bank statement" },
  ];

  const getProofOfAddressTitle = () => {
    switch (formData.proofOfAddressType) {
      case "ghana_post_code":
        return "Ghana post code";
      case "utility_bill":
        return "Upload utility bill";
      case "bank_statement":
        return "Upload bank statement";
      default:
        return "Proof of address";
    }
  };

  const handleProofTypeSelect = (value: string) => {
    onProofTypeChange(
      value as "ghana_post_code" | "utility_bill" | "bank_statement",
    );
  };

  return (
    <div className="space-y-4">
      {!hideRadioGroup && (
        <>
          <p className=" !mb-0 text-sm font-semibold">Proof of Address</p>
          <RadioGroup
            value={formData.proofOfAddressType || ""}
            onValueChange={handleProofTypeSelect}
          >
            {proofTypeOptions.map((option) => (
              <RadioGroupItem
                key={option.value}
                value={option.value}
                label={option.label}
                selected={formData.proofOfAddressType === option.value}
                onClick={() => handleProofTypeSelect(option.value)}
                itemClassName="bg-transparent border border-solid border-[#73796E]"
                unselectedRadioClass="border-gray-300"
              />
            ))}
          </RadioGroup>
        </>
      )}

      {formData.proofOfAddressType && (
        <div className="space-y-4">
          <p className=" !mb-0 text-sm font-semibold">
            {getProofOfAddressTitle()}
          </p>

          {formData.proofOfAddressType === "ghana_post_code" && (
            <FormInput
              name="ghanaPostCode"
              type="text"
              placeholder="E.g. GA 000-0000"
              className="border-input-border  w-3/4 xl:w-1/2"
              pattern="[a-zA-Z0-9-]*"
              onInput={handlePostCodeInput}
            />
          )}

          {(formData.proofOfAddressType === "utility_bill" ||
            formData.proofOfAddressType === "bank_statement") && (
            <FileUpload<DocumentUploadResponse>
              maxFiles={1}
              allowedTypes={["pdf", "jpg", "jpeg", "png"]}
              uploadFunction={uploadFunction}
              initialFiles={
                formData.proofOfAddressDocument
                  ? [
                      {
                        id: `proof-${Date.now()}`,
                        name: formData.proofOfAddressDocument.filename,
                        size: formData.proofOfAddressDocument.size,
                        type: formData.proofOfAddressDocument.type,
                        progress: 100,
                        status: "success" as const,
                        data: formData.proofOfAddressDocument,
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
          )}
        </div>
      )}
    </div>
  );
}
