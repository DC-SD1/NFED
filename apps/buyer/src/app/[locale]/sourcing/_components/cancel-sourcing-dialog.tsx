"use client";

import { useRouter } from "@bprogress/next/app";
import { Button } from "@cf/ui";
import { IconCircleX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

import ReasonDialog from "@/components/dialogs/reason-dialog";
import { useSourcingStore } from "@/lib/stores/sourcing-store";
import { logger } from "@/lib/utils/logger";

export default function CancelSourcingDialog() {
  const router = useRouter();
  const { isCancelSourcingEnabled, clearAll: resetSourcingStore } =
    useSourcingStore();
  const t = useTranslations("sourcing");

  // const api = useApiClient();
  const isPending = false; // Is sending reason for cancellation.

  return (
    <ReasonDialog
      config={{
        header: {
          title: t("cancelSouring.title"),
          description: t("cancelSouring.description"),
        },
        form: {
          label: t("cancelSouring.form.reason"),
          placeholder: t("cancelSouring.form.reasonPlaceholder"),
          minLength: 3,
        },
        actions: {
          cancel: t("cancelSouring.form.cancel"),
          confirm: t("cancelSouring.form.confirm"),
        },
        styles: {
          contentClassName: "sm:max-w-[480px]",
        },
      }}
      trigger={
        <Button
          size="lg"
          variant="unstyled"
          disabled={!isCancelSourcingEnabled()}
          className="px-6 font-bold text-[hsl(var(--text-dark))] hover:text-[hsl(var(--text-dark))] focus:text-[hsl(var(--text-dark))]"
        >
          <IconCircleX stroke={2} />
          <span>{t("sourcingPopup.cancel")}</span>
        </Button>
      }
      isPending={isPending}
      onSubmit={(values) => {
        resetSourcingStore(); // Resets the store and clears local storage.
        logger.info("cancel reason:", { reason: values.reason });
        router.push("/home");
      }}
    />
  );
}
