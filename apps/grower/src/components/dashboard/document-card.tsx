import { Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import type { DocumentResource } from "@/types/learning-resources";

interface DocumentCardProps {
  document:
    | DocumentResource
    | {
        title: string;
        url?: string;
        resourceUrl?: string;
        size?: string;
        formattedFileSize?: string;
      };
  onClick: () => void;
}

export default function DocumentCard({ document, onClick }: DocumentCardProps) {
  const t = useTranslations("dashboard.learningResources");

  return (
    <button
      className="bg-card-light-background flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${t("documentAriaLabelPrefix")}: ${document.title}`}
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-red-50 sm:size-14">
        <FileText className="size-6 text-red-500 sm:size-7" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-sm font-medium sm:line-clamp-1">
          {document.title}
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          {(document as DocumentResource).formattedFileSize ||
            (document as any).size}
        </p>
      </div>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-50 sm:size-10">
        <Download className="text-primary size-4 sm:size-5" />
      </div>
    </button>
  );
}
