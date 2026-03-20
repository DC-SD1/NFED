"use client";

import { JPGIcon, PDFIcon, TrashIcon } from "@cf/ui/icons";
import { cva } from "class-variance-authority";

interface FileCardProps {
  filename: string;
  fileType: string;
  fileSize?: string;
  onRemove: () => void;
  displayBadge?: boolean;
  badge?: string;
}

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();

  if (type === "jpg") {
    return <JPGIcon />;
  }
  if (type === "pdf") {
    return <PDFIcon />;
  }

  return <JPGIcon />;
};

const badgeVariants = cva(
  "inline-block text-xs font-normal rounded-lg px-2.5 py-0.5 mb-2",
  {
    variants: {
      status: {
        pending: "bg-gray-dark text-white",
        approved: "bg-green-500 text-white",
        rejected: "bg-red-500 text-white",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  },
);

export default function FileCard({
  filename,
  fileType,
  fileSize,
  onRemove,
  displayBadge = false,
  badge = "Pending",
}: FileCardProps) {
  const badgeClassName = badgeVariants({
    status: badge.toLowerCase() as "pending" | "approved" | "rejected",
  });

  return (
    <div className="border-input-border max-w-2xl rounded-xl border bg-white px-4 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {displayBadge && <p className={badgeClassName}>{badge}</p>}

      <div className="flex min-h-[80px] w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center space-x-4">
          <div className="shrink-0">{getFileIcon(fileType)}</div>

          <div className="min-w-0 flex-1">
            <p className="truncate  font-thin">{filename}</p>
            <p className="text-gray-dark mt-1 text-xs">{fileSize}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="bg-gray-light shrink-0 rounded-full p-2 transition-colors duration-200"
          aria-label="Remove file"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
