"use client";

import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

import PrimaryButton from "@/components/buttons/primary-button";
import RadioButton from "@/components/common/radio-button";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import AppDialogFooter from "@/components/modals/app-dialog-footer";
import { useCSVDownload } from "@/hooks/use-csv-download";
import { useApiClient } from "@/lib/api";
import useTableStore from "@/lib/stores/table-store/table-store";
import { useModal } from "@/lib/stores/use-modal";
import { logger } from "@/lib/utils/logger";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { ExportAllResponse } from "@/types/user-management.types";
import { EXPORT_TYPES } from "@/utils/constants/status-constants";
import { getExportEndpoint } from "@/utils/helpers/file-helper";

const ExportListDialog = () => {
  const { isOpen, type, data, onClose } = useModal();
  const { exportType, setExportType } = useTableStore();
  const t = useTranslations("userManagement.exportUser");
  const isModalOpen = isOpen && type === "ExportList";
  const [filterType, setFilterType] = useState("all-items");
  const { downloadFromURL, isDownloading, error } = useCSVDownload();
  const api = useApiClient();
  const [exporting, setExporting] = useState(false);
  const exportName = data?.exportName;

  const handleFilterTypeChange = (type: string) => {
    setFilterType(type);
  };

  const handleExport = async () => {
    if (!exportName || filterType === "") return;
    if (filterType === EXPORT_TYPES.itemsMatchingAppliedFilters) {
      setExportType({
        ...exportType,
        type: filterType,
        isFilteringData: true,
      });
      return;
    }
    await handleFetchExportAllUrl();
  };

  const handleDownload = async (downloadUrl?: string) => {
    if (!downloadUrl) return;
    await downloadFromURL({
      url: downloadUrl,
      filename: `${filterType}_${exportName}`,
      api: api,
    });
    if (!error) {
      showSuccessToast("Exported successful");
      handleCloseDialog();
    } else {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    if (
      exportType?.downloadUrl &&
      filterType === EXPORT_TYPES.itemsMatchingAppliedFilters
    ) {
      void handleDownload(exportType.downloadUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportType?.downloadUrl, filterType]);

  const handleCloseDialog = () => {
    setExportType(null);
    onClose();
  };

  if (!isModalOpen) return null;

  const handleFetchExportAllUrl = async () => {
    const exportEndpoint = getExportEndpoint(exportName ?? "");
    try {
      setExporting(true);
      const response = await api.client.GET(exportEndpoint);
      const responseData = (response as any).data as ExportAllResponse;
      setExporting(false);

      await handleDownload(responseData.data.downloadLink);
    } catch (e) {
      showErrorToast(t("exportErrorMessage"));
      logger.error(t("exportErrorMessage"), e);
    }
  };

  return (
    <AppDialog
      isOpen={isOpen}
      size={"large"}
      title={t("title")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        handleCloseDialog();
      }}
      content={
        <>
          <AppDialogContent>
            <div className="flex flex-col gap-[28px]">
              <div className={"flex flex-col rounded-2xl border px-6"}>
                <button
                  onClick={() => handleFilterTypeChange("all-items")}
                  className={
                    "flex w-full items-center justify-between gap-4 py-4"
                  }
                >
                  <p>{t("allItems")}</p>
                  <RadioButton
                    id="all-items"
                    name="export-type"
                    value="all-items"
                    checked={filterType === "all-items"}
                    onChange={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </button>
                <hr className="h-0.5" />

                <button
                  onClick={() => {
                    handleFilterTypeChange("items-matching-applied-filters");
                  }}
                  className={
                    "flex w-full items-center justify-between gap-4 py-4"
                  }
                >
                  <p>{t("itemsMatchingAppliedFilters")}</p>
                  <RadioButton
                    id="items-matching-applied-filters"
                    name="export-type"
                    value="items-matching-applied-filters"
                    checked={filterType === "items-matching-applied-filters"}
                    onChange={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-secondary-foreground text-sm font-semibold uppercase">
                  {t("fileFormatTitle")}
                </p>
                <div className={"flex flex-col rounded-2xl border p-6"}>
                  <p className="font-semibold">{t("fileFormatOptions.csv")}</p>
                  <p className="text-secondary-foreground text-sm">
                    {t("fileFormatDescription")}
                  </p>
                </div>
              </div>
            </div>
          </AppDialogContent>

          <AppDialogFooter className="flex justify-end">
            <PrimaryButton
              buttonContent={
                exportType?.isFilteringData || exporting
                  ? "Exporting..."
                  : isDownloading
                    ? "Downloading..."
                    : t("exportButton")
              }
              isLoading={
                exportType?.isFilteringData || isDownloading || exporting
              }
              disabled={filterType === ""}
              onClick={handleExport}
              className="rounded-xl px-10"
            />
          </AppDialogFooter>
        </>
      }
    />
  );
};

export default ExportListDialog;
