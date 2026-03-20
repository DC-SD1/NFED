import { useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";

/**
 * @name useAvatarUpdate
 * @description A reusable React hook for updating and removing a user's avatar using Clerk in a Next.js application.
 * It includes file size validation, error handling, and provides the current avatar URL and loading state.
 *
 * @returns {{
 *   updateAvatar: (file: File) => Promise<string | undefined>,
 *   removeAvatar: () => Promise<void>,
 *   isUploading: boolean,
 *   uploadError: string | null,
 *   currentAvatarUrl: string | undefined
 * }}
 * - `updateAvatar`: Uploads and updates the user's avatar. Throws error if file size exceeds `MAX_FILE_SIZE`.
 * - `removeAvatar`: Removes the user's avatar and reloads user data.
 * - `isUploading`: Boolean that indicates if an upload or removal operation is in progress.
 * - `uploadError`: Holds error messages from the last avatar operation.
 * - `currentAvatarUrl`: The currently active avatar URL for the logged-in user.
 *
 * @example
 * const {
 *   updateAvatar,
 *   removeAvatar,
 *   isUploading,
 *   uploadError,
 *   currentAvatarUrl
 * } = useAvatarUpdate();
 *
 * // Example: Uploading a new avatar
 * await updateAvatar(file);
 *
 * // Example: Removing the avatar
 * await removeAvatar();
 */

export function useAvatarUpdate(): {
  updateAvatar: (file: File) => Promise<string | undefined>;
  removeAvatar: () => Promise<void>;
  isUploading: boolean;
  uploadError: string | null;
  currentAvatarUrl: string | undefined;
} {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Validate file size before upload
      if (file.size > MAX_FILE_SIZE) {
        const errorMessage = `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${MAX_FILE_SIZE}MB)`;
        setUploadError(errorMessage);
        throw new Error(errorMessage);
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // Update user avatar using Clerk's setProfileImage method
        await user.setProfileImage({ file });

        // Reload user data to get updated avatar URL
        await user.reload();

        return user.imageUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update avatar";
        setUploadError(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const removeAvatar = useCallback(async () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Remove the current profile image
      await user.setProfileImage({ file: null });
      await user.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove avatar";
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  return {
    updateAvatar,
    removeAvatar,
    isUploading,
    uploadError,
    currentAvatarUrl: user?.imageUrl,
  };
}
