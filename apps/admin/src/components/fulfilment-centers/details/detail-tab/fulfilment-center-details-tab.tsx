import { Button, cn, Dialog, DialogContent } from "@cf/ui";
import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import FulfilmentCenterFullDetailTab from "@/components/fulfilment-centers/details/detail-tab/fulfilment-center-full-detail-tab";
import FulfilmentCenterPhotosTab from "@/components/fulfilment-centers/details/detail-tab/fulfilment-center-photos-tab";
import AppTabs from "@/components/tabs/app-tabs";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import { showSuccessToast } from "@/lib/utils/toast";
import type { FulfilmentCenter } from "@/types/fulfilment-centers.types";
import { ImageAssets } from "@/utils/image-assets";

interface Props {
  center?: FulfilmentCenter | null;
}

export default function FulfilmentCenterDetailsTab({ center }: Props) {
  const t = useTranslations("fulfillmentCenters.details");
  const updateCustomFulfilmentCenter =
    useFulfilmentCenterStore.use.updateCustomFulfilmentCenter();
  const photos = center?.photos ?? [];

  const [isUpdatePhotoOpen, setIsUpdatePhotoOpen] = useState(false);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState<
    string | null
  >(photos.length > 0 ? (photos[0] ?? null) : null);

  const handleUpdateProfilePhoto = () => {
    if (center && selectedProfilePhoto) {
      // Reorder photos: move selected to front
      const otherPhotos = photos.filter((p) => p !== selectedProfilePhoto);
      const newPhotos = [selectedProfilePhoto, ...otherPhotos];

      // Update in store (if custom)
      updateCustomFulfilmentCenter(center.id, { photos: newPhotos });

      showSuccessToast("Fulfilment center photo updated");
      setIsUpdatePhotoOpen(false);
    }
  };

  const currentProfilePhoto = photos.length > 0 ? (photos[0] ?? null) : null;

  return (
    <div className={"flex flex-col gap-4"}>
      <div
        className={"flex w-full items-center gap-4 rounded-xl border px-6 py-4"}
      >
        <div
          role="button"
          tabIndex={0}
          className="relative cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            setSelectedProfilePhoto(currentProfilePhoto);
            setIsUpdatePhotoOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setSelectedProfilePhoto(currentProfilePhoto);
              setIsUpdatePhotoOpen(true);
            }
          }}
        >
          {currentProfilePhoto ? (
            <Image
              src={currentProfilePhoto}
              alt={"avatar"}
              className={"size-[84px] rounded-2xl object-cover"}
              width={84}
              height={84}
            />
          ) : (
            <Image
              src={ImageAssets.CENTER}
              alt={"avatar"}
              className={"size-[84px] rounded-2xl object-cover"}
              width={84}
              height={84}
            />
          )}
        </div>
        <div>
          <p className={"text-[28px] font-bold"}>{center?.name ?? ""}</p>
          <p className={"text-secondary-foreground"}>
            {center?.locationAddress ?? ""}
          </p>
        </div>
      </div>

      <Dialog open={isUpdatePhotoOpen} onOpenChange={setIsUpdatePhotoOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="flex flex-col gap-6">
            <h2 className="text-center text-xl font-bold">
              Choose profile image
            </h2>
            {photos.length === 0 ? (
              <p className="text-center text-gray-500">
                No photos available to select.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {photos.map((photo, index) => {
                  const isSelected = selectedProfilePhoto === photo;
                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={index}
                      className={cn(
                        "relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-white transition-all focus:outline-none focus:ring-2 focus:ring-[#36B92E] focus:ring-offset-2",
                        isSelected
                          ? "border-2 border-[#36B92E] shadow-sm"
                          : "border border-transparent hover:border-gray-200",
                      )}
                      onClick={() => setSelectedProfilePhoto(photo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedProfilePhoto(photo);
                        }
                      }}
                    >
                      <Image
                        src={photo}
                        alt={`Option ${index}`}
                        className={cn(
                          "h-full w-full object-cover",
                          isSelected && "opacity-40",
                        )}
                        width={100}
                        height={100}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                            <IconCheck
                              size={24}
                              className="text-[#36B92E]"
                              stroke={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button
                disabled={!selectedProfilePhoto}
                className={cn(
                  "min-w-[140px] rounded-lg text-base font-bold text-white",
                  selectedProfilePhoto
                    ? "bg-[#36B92E] hover:bg-[#36B92E]/90"
                    : "bg-gray-300",
                )}
                onClick={handleUpdateProfilePhoto}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className={"rounded-xl border py-2"}>
        <AppTabs
          tabs={[
            {
              value: "detail",
              label: t("detailsTab.detail"),
              content: <FulfilmentCenterFullDetailTab center={center} />,
            },
            {
              value: "photos",
              label: t("detailsTab.photos"),
              content: <FulfilmentCenterPhotosTab center={center} />,
            },
          ]}
          defaultValue={"detail"}
        />
      </div>
    </div>
  );
}
