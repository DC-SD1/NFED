"use client";

import { Dialog, DialogContent } from "@cf/ui";
import Image from "next/image";
import React, { useState } from "react";

import ContentEmptyState from "@/components/common/content-empty-state";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  center?: FulfilmentCenter | null;
}

export default function FulfilmentCenterPhotosTab({ center }: Props) {
  const photos = center?.photos ?? [];
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <>
      {photos.length === 0 ? (
        <div className={"flex justify-center py-10"}>
          <ContentEmptyState
            imgSrc={ImageAssets.PHOTOS_FOLDER}
            title={"No photos available"}
            message={"All photos submitted will be displayed when available"}
          />
        </div>
      ) : (
        <div className={"flex flex-1 flex-wrap gap-4 px-6 pb-4"}>
          {photos.map((photo, index) => (
            <div
              role="button"
              tabIndex={0}
              key={index}
              className="cursor-pointer rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:ring-offset-2"
              onClick={() => setSelectedPhoto(photo)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedPhoto(photo);
                }
              }}
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                className={"size-[212px] rounded-2xl object-cover"}
                width={212}
                height={212}
              />
            </div>
          ))}

          <Dialog
            open={!!selectedPhoto}
            onOpenChange={(open) => !open && setSelectedPhoto(null)}
          >
            <DialogContent
              className="max-w-3xl overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-[800px]"
              closeClassName="hidden" // Hiding default close button for cleaner look if preferred, or keep it. Screenshot didn't show one prominently.
            >
              {selectedPhoto && (
                <div className="relative flex items-center justify-center">
                  <Image
                    src={selectedPhoto}
                    alt="Expanded view"
                    className="h-auto w-full rounded-2xl object-cover"
                    width={800}
                    height={600}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
