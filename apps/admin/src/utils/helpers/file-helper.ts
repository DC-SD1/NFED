import type {ApiClient} from "@cf/api";

/**
 * @name downloadCSVFromURL
 * @description Downloads a CSV file directly from a given URL by creating a temporary anchor element and triggering a click event.
 Works in most modern browsers without requiring additional libraries.
 * @param {string} url - The URL pointing to the CSV file to be downloaded.
 * @param filename
 * @param api
 * @returns {Promise<void>} A promise that resolves when the download is triggered successfully, or rejects if an error occurs.
 * @example // Download with custom filename
 // Download with custom filename
 downloadCSVFromURL("https://example.com/data.csv", "my-data.csv");

 // Download with default filename
 downloadCSVFromURL("https://example.com/data.csv");
 */
export async function downloadCSVFromURL({
  url,
  filename,
  api,
}: {
  url: string;
  filename?: string;
  api: ApiClient;
}): Promise<void> {
  try {
    const { pathname, search } = new URL(url);
    const uri = `${pathname}${search}`;
    const response: any = await api.client.GET(uri as any, {
      parseAs: "text",
    });

    if (response?.error) {
      throw new Error(`HTTP error! status: ${response.error}`);
    }

    if (!response) {
      throw new Error("Response body is null");
    }

    // const blob = await response.blob();
    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename
      ? `${filename}.csv`
      : `export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * @name downloadCSVWithProgress
 * @description Downloads a CSV file from a given URL with progress tracking support.
 *              It streams the response body in chunks, updates progress, and finally
 *              saves the file locally as a `.csv`.
 *
 * @param {string} url - The URL of the CSV file to download.
 * @param {string} [filename] - Optional filename to save the CSV as. Defaults to `export_<YYYY-MM-DD>.csv`.
 * @param {(progress: number) => void} [onProgress] - Optional callback to track download progress (0-100).
 *
 * @returns {Promise<void>} Resolves when the file is successfully downloaded.
 *
 * @throws {Error} Throws an error if the request fails or response body is missing.
 *
 * @example
 * ```ts
 * await downloadCSVWithProgress(
 *   "https://example.com/data.csv",
 *   "my-data.csv",
 *   (progress) => console.log(`Progress: ${progress.toFixed(2)}%`)
 * );
 * ```
 */

export interface DownloadCSVWithProgressProps {
  url: string;
  filename?: string;
  onProgress?: (progress: number) => void;
  api: ApiClient;
}

export async function downloadCSVWithProgress({
  url,
  filename,
  onProgress,
  api,
}: DownloadCSVWithProgressProps): Promise<void> {
  try {
    const { pathname, search } = new URL(url);
    const uri = `${pathname}${search}`;
    const response: any = await api.client.GET(uri as any, {
      parseAs: "text",
    });

    if (response?.error) {
      throw new Error(`HTTP error! status: ${response.error}`);
    }

    if (!response) {
      throw new Error("Response body is null");
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.data.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      received += value.length;

      if (onProgress && total > 0) {
        onProgress((received / total) * 100);
      }
    }

    // Combine chunks into single array
    const allChunks = new Uint8Array(received);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    // Create blob and download
    const blob = new Blob([allChunks], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    console.log("CREATE DOWNLOAD URL", downloadUrl);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename
      ? `${filename}.csv`
      : `export_${new Date().toISOString().split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * @name getImageTypeFromBuffer
 * @description Detects if a file is PNG or JPEG by checking its binary signature (magic numbers).
 * @param {File} file - The file to inspect.
 * @returns {Promise<'png' | 'jpeg' | 'unknown'>} The detected image type.
 */
export async function getImageTypeFromBuffer(
  file: File,
): Promise<"png" | "jpeg" | "unknown"> {
  // Read the first 4 bytes
  const buffer = await file.slice(0, 4).arrayBuffer();
  const arr = new Uint8Array(buffer);

  // Convert bytes to hex string
  let header = "";
  for (const byte of arr) {
    header += byte.toString(16).padStart(2, "0");
  }

  header = header.toLowerCase();

  // Check file signatures
  if (header.startsWith("89504e47")) return "png"; // PNG
  if (header.startsWith("ffd8ff")) return "jpeg"; // JPEG/JPG

  return "unknown";
}

/**
 * @name getExportEndpoint
 * @description Returns the export endpoint for a given export name.
 * @param {string} exportName - The name of the export.
 * @returns {string} The export endpoint.
 */

type ExportEndpoints =
  | "/admin/users/export-all"
  | "/customer-management/formal-growers/export-all"
  | "/fulfillment-centers/export-all"
  | "/customer-management/agents/export-all";

export function getExportEndpoint(exportName: string): ExportEndpoints {
  switch (exportName) {
    case "users":
      return "/admin/users/export-all";

    case "growers":
      return "/customer-management/formal-growers/export-all";

    case "agents":
      return "/customer-management/agents/export-all";

    case "fulfilment-centers":
      return "/fulfillment-centers/export-all";

    default:
      return "/admin/users/export-all";
  }
}

export async function base64ArrayToFiles(
  base64Images: string[],
): Promise<File[]> {
  const filePromises = base64Images.map(
    async (image, index): Promise<File | null> => {
      try {
        const res = await fetch(image);
        const blob = await res.blob();
        const extension = blob.type.split("/")[1];
        const filename = `image-${Date.now()}${Math.random()}-${index}.${extension}`;

        return new File([blob], filename, { type: blob.type });
      } catch (error) {
        console.error(`Failed to convert image ${index}:`, error);
        return null;
      }
    },
  );

  const files = await Promise.all(filePromises);
  return files.filter((file): file is File => file !== null);
}
