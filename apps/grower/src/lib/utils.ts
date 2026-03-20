export { cn } from "@cf/ui";

export function convertFileType(fileType: string): number {
  switch (fileType) {
    case "application/pdf":
      return 1;
    case "image/png":
      return 2;
    case "image/jpeg":
      return 2;
    case "image/jpg":
      return 3;
    default:
      return 1;
  }
}

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as any).status === 401
  ) {
    return false;
  }
  return failureCount < 3;
}
