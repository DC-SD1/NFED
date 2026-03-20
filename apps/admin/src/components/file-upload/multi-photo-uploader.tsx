"use client";

import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

export interface ImageProps {
  id: number;
  url?: string | ArrayBuffer | null;
}

interface Props {
  label?: string;
  info?: string;
  onImagesChange?: (images: ImageProps[]) => void;
  initialImages?: ImageProps[];
  multiple?: boolean;
}

export default function MultiPhotoUploader({
  label,
  info,
  onImagesChange,
  initialImages,
  multiple = false,
}: Props) {
  const [images, setImages] = useState<ImageProps[]>([]);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    files.forEach((file) => {
      if (file?.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newFile = {
            id: Date.now() + Math.random(),
            url: event?.target?.result,
          };
          onImagesChange?.([...images, newFile]);
          setImages((prev) => [...prev, newFile]);
        };
        reader.onerror = () => {
          console.error("Failed to read file:", file?.name);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = "";
  };

  const removeImage = (id: number) => {
    onImagesChange?.(images.filter((img) => img.id !== id));
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col">
      {label && <h2 className="mb-1 text-sm font-medium">{label}</h2>}
      {info && <p className="text-secondary-foreground mb-2 text-xs">{info}</p>}

      <div className="flex gap-4 overflow-x-auto">
        {/* Upload Button */}
        <label className="flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-dashed">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleImageUpload}
            className="hidden"
            multiple={multiple}
          />
          <Plus className="s-6 text-primary" />
        </label>

        {/* Uploaded Images */}
        {images.map((image) => (
          <ImagePreview
            image={image}
            key={image.id}
            removeImage={removeImage}
          />
        ))}
      </div>
    </div>
  );
}

const ImagePreview = ({
  image,
  removeImage,
}: {
  image: ImageProps;
  removeImage: (id: number) => void;
}) => {
  return (
    <div
      key={image.id}
      className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border"
    >
      <Image
        src={`${image.url as string}`}
        alt="Uploaded"
        fill
        className="object-cover"
        unoptimized
      />
      <button
        onClick={() => removeImage(image.id)}
        className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg"
      >
        <Trash2 className="size-4 text-green-600" />
      </button>
    </div>
  );
};
