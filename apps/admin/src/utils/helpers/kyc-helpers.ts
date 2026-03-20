import type {KycResponse} from "@/types/all-request.types";

/**
 * @name areAllDocumentsAndDetailsAccepted
 * @description Checks if all document and detail statuses are "Accepted".
 * @param {Object} data - The object containing `documents` and `details`.
 * @param type
 * @returns {boolean} True if all are accepted.
 */
export function areAllDocumentsAndDetailsAccepted(
  data: KycResponse,
  type: string,
): boolean {
  const documents = data.value?.documents;
  const details = data.value?.details;

  let docCategories: string[];
  if (type === "Buyer") {
    docCategories = ["corp_identity", "finance", "auth_rep"];
  } else {
    docCategories = details?.grower_local
      ? ["grower_local_documents"]
      : ["grower_intl_documents"];
  }

  // ✅ Check all document arrays
  const allDocumentsAccepted = docCategories.every((category) => {
    const docs = documents?.[category] || [];
    return docs.every(
      (doc: { document_status?: string }) => doc.document_status === "Accepted",
    );
  });

  // ✅ Check certification (single object)
  const certificationAccepted = documents?.certification
    ? documents.certification.document_status === "Accepted"
    : true;

  // ✅ Check both detail sections
  const section = details?.[
    details?.grower_local ? "grower_local" : "grower_intl"
  ] as { details_status?: string } | undefined;
  const allDetailsAccepted =
    type === "Buyer" ? true : section?.details_status === "Accepted";

  // ✅ Final result
  return allDocumentsAccepted && certificationAccepted && allDetailsAccepted;
}

export const getStepPercentage = (step: number, type: string): number => {
  switch (type) {
    case "Buyer":
      return step === 1 ? 15 : step === 2 ? 45 : step === 3 ? 60 : 80;
    default:
      return step === 1 ? 25 : step === 2 ? 50 : 75;
  }
};

export const showNextStepButton = (step: number, type: string): boolean => {
  return step < (type === "Buyer" ? 4 : 3);
};
