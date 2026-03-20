"use client";

import React, { createContext, useContext, useState } from "react";

interface KycResubmissionTrackerContextType {
  markDocumentAsResubmitted: (documentId: string) => void;
  isDocumentResubmitted: (documentId: string) => boolean;
  markDocumentForResubmission: (documentId: string) => void;
  isDocumentMarkedForResubmission: (documentId: string) => boolean;
  markFieldAsResubmitted: (fieldName: string, documentId: string) => void;
  isFieldResubmitted: (fieldName: string) => boolean;
  markFieldUploaded: (fieldName: string, documentId: string) => void;
  isFieldUploaded: (fieldName: string) => boolean;
  clearFieldUploaded: (fieldName: string) => void;
  markFieldUploading: (fieldName: string) => void;
  isFieldUploading: (fieldName: string) => boolean;
  clearFieldUploading: (fieldName: string) => void;
  clearAllTracking: () => void;
  resubmittedDocuments: Set<string>;
  documentsMarkedForResubmission: Set<string>;
  resubmittedFields: Map<string, string>; // fieldName -> documentId mapping
  uploadedFields: Map<string, string>; // fieldName -> documentId mapping for actual uploads
  uploadingFields: Set<string>; // fieldName set for fields currently uploading
}

const KycResubmissionTrackerContext = createContext<KycResubmissionTrackerContextType | null>(null);

/**
 * Hook to track KYC document resubmissions
 * This hook provides functions to mark documents as resubmitted and check their status
 */
export function useKycResubmissionTracker() {
  const context = useContext(KycResubmissionTrackerContext);

  if (!context) {
    throw new Error("useKycResubmissionTracker must be used within a KycResubmissionTrackerProvider");
  }

  return context;
}

/**
 * Provider component for KYC resubmission tracking
 * This should wrap the parts of the app that need to track resubmissions
 */
export function KycResubmissionTrackerProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with localStorage persistence
  const [resubmittedDocuments, setResubmittedDocuments] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kyc-resubmitted-documents');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const [documentsMarkedForResubmission, setDocumentsMarkedForResubmission] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kyc-documents-marked-for-resubmission');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const [resubmittedFields, setResubmittedFields] = useState<Map<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kyc-resubmitted-fields');
      return stored ? new Map(JSON.parse(stored)) : new Map();
    }
    return new Map();
  });

  const [uploadedFields, setUploadedFields] = useState<Map<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kyc-uploaded-fields');
      return stored ? new Map(JSON.parse(stored)) : new Map();
    }
    return new Map();
  });

  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());

  // Persist state to localStorage whenever it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyc-resubmitted-documents', JSON.stringify(Array.from(resubmittedDocuments)));
    }
  }, [resubmittedDocuments]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyc-documents-marked-for-resubmission', JSON.stringify(Array.from(documentsMarkedForResubmission)));
    }
  }, [documentsMarkedForResubmission]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyc-resubmitted-fields', JSON.stringify(Array.from(resubmittedFields.entries())));
    }
  }, [resubmittedFields]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyc-uploaded-fields', JSON.stringify(Array.from(uploadedFields.entries())));
    }
  }, [uploadedFields]);

  const markDocumentAsResubmitted = (documentId: string) => {
    setResubmittedDocuments(prev => new Set([...prev, documentId]));
  };

  const isDocumentResubmitted = (documentId: string) => {
    return resubmittedDocuments.has(documentId);
  };

  const markDocumentForResubmission = (documentId: string) => {
    setDocumentsMarkedForResubmission(prev => new Set([...prev, documentId]));
  };

  const isDocumentMarkedForResubmission = (documentId: string) => {
    return documentsMarkedForResubmission.has(documentId);
  };

  const markFieldAsResubmitted = (fieldName: string, documentId: string) => {
    setResubmittedFields(prev => new Map([...prev, [fieldName, documentId]]));
  };

  const isFieldResubmitted = (fieldName: string) => {
    return resubmittedFields.has(fieldName);
  };

  const markFieldUploaded = (fieldName: string, documentId: string) => {
    setUploadedFields(prev => new Map([...prev, [fieldName, documentId]]));
  };

  const isFieldUploaded = (fieldName: string) => {
    return uploadedFields.has(fieldName);
  };

  const clearFieldUploaded = (fieldName: string) => {
    setUploadedFields(prev => {
      const newMap = new Map(prev);
      newMap.delete(fieldName);
      return newMap;
    });
  };

  const markFieldUploading = (fieldName: string) => {
    setUploadingFields(prev => new Set([...prev, fieldName]));
  };

  const isFieldUploading = (fieldName: string) => {
    return uploadingFields.has(fieldName);
  };

  const clearFieldUploading = (fieldName: string) => {
    setUploadingFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  const clearAllTracking = () => {
    setResubmittedDocuments(new Set());
    setDocumentsMarkedForResubmission(new Set());
    setResubmittedFields(new Map());
    setUploadedFields(new Map());
    setUploadingFields(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyc-resubmitted-documents');
      localStorage.removeItem('kyc-documents-marked-for-resubmission');
      localStorage.removeItem('kyc-resubmitted-fields');
      localStorage.removeItem('kyc-uploaded-fields');
    }
  };

  return React.createElement(
    KycResubmissionTrackerContext.Provider,
    {
      value: {
        markDocumentAsResubmitted,
        isDocumentResubmitted,
        markDocumentForResubmission,
        isDocumentMarkedForResubmission,
        markFieldAsResubmitted,
        isFieldResubmitted,
        markFieldUploaded,
        isFieldUploaded,
        clearFieldUploaded,
        markFieldUploading,
        isFieldUploading,
        clearFieldUploading,
        clearAllTracking,
        resubmittedDocuments,
        documentsMarkedForResubmission,
        resubmittedFields,
        uploadedFields,
        uploadingFields,
      }
    },
    children
  );
}