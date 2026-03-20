"use client";

import { Button } from "@cf/ui";
import { IconDownload } from "@tabler/icons-react";
import React, { useState } from "react";

import DashboardExportDialog from "./dashboard-export-dialog";
import DashboardExportPreviewDialog from "./dashboard-export-preview-dialog";

export default function DashboardExportAction() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const handleGenerate = () => {
    setIsExportDialogOpen(false);
    setIsPreviewDialogOpen(true);
  };

  const handleFinalExport = () => {
    console.log("Final export triggered");
    setIsPreviewDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-fit gap-2 border-none bg-[#F3F4F1] text-gray-700 hover:bg-[#e5e7eb]"
        onClick={() => setIsExportDialogOpen(true)}
      >
        <IconDownload size={16} />
        Export
      </Button>

      <DashboardExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onGenerate={handleGenerate}
      />

      <DashboardExportPreviewDialog
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        onExport={handleFinalExport}
      />
    </>
  );
}
