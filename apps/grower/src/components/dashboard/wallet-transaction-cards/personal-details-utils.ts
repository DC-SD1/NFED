import type { Country } from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";

export const getCountryFromPhone = (phone: string): Country => {
  if (phone) {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.country || "GH";
    } catch {
      return "GH";
    }
  }
  return "GH";
};

export const getExperienceStatus = (years: number): string => {
  if (years >= 5) return "Experienced";
  if (years >= 2) return "Intermediate";
  return "Beginner";
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

export const getCroppedImage = async (
  imagePreview: string | null,
  cropPosition: { x: number; y: number },
  zoom: number,
): Promise<Blob | null> => {
  if (!imagePreview) return null;

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();

    image.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Draw circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate scale and position
        const scale = zoom;
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Draw image
        ctx.drawImage(
          image,
          -cropPosition.x * scale,
          -cropPosition.y * scale,
          scaledWidth,
          scaledHeight,
        );
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95,
      );
    };

    image.onerror = () => {
      resolve(null);
    };

    image.src = imagePreview;
  });
};
