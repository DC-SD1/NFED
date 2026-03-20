"use client";

import { Button } from "@cf/ui/components/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import type { ModalData } from "@/types/modal-types";

export default function SelectOptionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  data?: ModalData;
}) {
  const t = useTranslations("dashboard.emptyState");
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="border-input relative w-[90vw] max-w-sm rounded-3xl border bg-white p-5 shadow-xl">
        <Button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-transparent p-1 text-lg font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="size-10" />
        </Button>

        <h2 className="mb-4 text-center text-lg font-semibold">
          {t("select")}
        </h2>
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() =>
              handleNavigate("/farm-owner/invite-farm-manager/manager-info")
            }
          >
            {t("inviteManager")}
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            disabled
            onClick={() => handleNavigate("/farm-owner/assign-myself")}
          >
            {t("assignYourself")}
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            disabled
            onClick={() => handleNavigate("/farm-owner/hire-manager")}
          >
            {t("hireManager")}
          </Button>
        </div>
      </div>
    </div>
  );
}
