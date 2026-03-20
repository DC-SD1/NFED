"use client";

import { ChevronRight } from "@cf/ui/icons";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import SuccessPage from "@/components/dashboard/success-page";
import { useFarmLandsFormStore } from "@/lib/stores/farm-lands-form-store";
import { useFarmLandsUploadStore } from "@/lib/stores/upload-store";

export default function FarmLandSuccessPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("FarmLands.success");
  const { farmName, resetForm } = useFarmLandsFormStore();
  const { resetUpload } = useFarmLandsUploadStore();

  // Get farm name from params or store
  const farmNameDisplay = (searchParams.get("farmName") ?? farmName).replace(
    /\+/g,
    " ",
  );

  // Reset stores when success page loads
  useEffect(() => {
    // Reset both stores to clear the data after successful farm creation
    resetForm();
    resetUpload();
  }, [resetForm, resetUpload]);

  // Redirect if no farm name available
  // useEffect(() => {
  //   if (!farmNameDisplay) {
  //     router.push("/farm-owner/farm-lands");
  //   }
  // }, [farmNameDisplay, router]);

  if (!farmNameDisplay) {
    return null;
  }

  // Format subtitle with farm name
  const subtitle = t("subtitle", { farmName: farmNameDisplay });
  const fullDescription = t("subtitleContinue");

  return (
    <SuccessPage
      title={t("title")}
      subtitle={subtitle}
      description={fullDescription}
      doneText={t("goToDashboard")}
      redirectUrl="/farm-owner"
      icon={<ChevronRight className="size-4 text-white" />}
    />
  );
}
