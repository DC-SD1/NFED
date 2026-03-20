"use client";

import type { ApiClient } from "@cf/api";
import { useCallback, useState } from "react";

import {
  downloadCSVFromURL,
  downloadCSVWithProgress,
} from "@/utils/helpers/file-helper";

export function useCSVDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const downloadFromURL = useCallback(
    async ({
      url,
      filename,
      useProgress = false,
      api,
    }: {
      url: string;
      filename?: string;
      useProgress?: boolean;
      api: ApiClient;
    }) => {
      setIsDownloading(true);
      setError(null);
      setProgress(0);

      try {
        if (useProgress) {
          await downloadCSVWithProgress({
            url,
            filename,
            onProgress: setProgress,
            api: api,
          });
        } else {
          await downloadCSVFromURL({ url: url, filename: filename, api: api });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Download failed");
      } finally {
        setIsDownloading(false);
        setProgress(0);
      }
    },
    [],
  );
  return {
    downloadFromURL,
    isDownloading,
    error,
    progress,
  };
}
