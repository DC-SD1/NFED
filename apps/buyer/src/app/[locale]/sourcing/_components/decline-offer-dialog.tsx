import { useRouter } from "@bprogress/next/app";
import { Button } from "@cf/ui";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import ReasonDialog from "@/components/dialogs/reason-dialog";
import { logger } from "@/lib/utils/logger";

export default function DeclineOfferDialog() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  // TODO: Decline offer.
  // const api = useApiClient();
  const isPending = false; // Is sending reason for declination.

  const offerDeclinedPath = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const locale = segments[0] || "en";
    return `/${locale}/sourcing/available-crops/offer-declined`;
  }, [pathname]);

  return (
    <ReasonDialog
      config={{
        header: {
          title: t("sourcing.offerReview.declineOffer.title"),
          description: t("sourcing.offerReview.declineOffer.description"),
        },
        form: {
          label: t("sourcing.offerReview.declineOffer.form.reason"),
          placeholder: t(
            "sourcing.offerReview.declineOffer.form.reasonPlaceholder",
          ),
          minLength: 3,
        },
        actions: {
          cancel: t("sourcing.offerReview.declineOffer.form.cancel"),
          confirm: t("sourcing.offerReview.declineOffer.form.confirm"),
        },
        styles: { contentClassName: "sm:max-w-[440px]" },
      }}
      trigger={
        <Button
          size="lg"
          className="h-[56px] w-[220px] rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--error))] hover:bg-[hsl(var(--error))] hover:text-[#FFFFFF]"
        >
          {t("sourcing.offerReview.footer.decline")}
        </Button>
      }
      isPending={isPending}
      onSubmit={(values) => {
        logger.info("decline reason:", { reason: values.reason });
        router.push(offerDeclinedPath);
      }}
    />
  );
}
