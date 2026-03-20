import { useRouter } from "@bprogress/next/app";
import { Button, Spinner } from "@cf/ui";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

import ActionDialog from "@/components/dialogs/action-dialog";
import { useSourcingStore } from "@/lib/stores/sourcing-store";

export default function SaveAndExitDialog() {
  const t = useTranslations();
  const router = useRouter();
  const { clearAll: resetSourcingStore } = useSourcingStore();

  // TODO: Save order as draft.
  const isPending = false;

  return (
    <ActionDialog
      config={{
        header: {
          title: t("sourcing.saveAndExit.title"),
          description: t("sourcing.saveAndExit.description"),
        },
        form: {
          cancelLabel: t("sourcing.saveAndExit.cancel"),
          confirmLabel: t("sourcing.saveAndExit.confirm"),
        },
        styles: {
          contentClassName: "sm:max-w-[480px]",
        },
      }}
      trigger={
        <Button
          size="lg"
          variant="unstyled"
          className="px-6 font-bold text-[hsl(var(--text-dark))] hover:text-[hsl(var(--text-dark))] focus:text-[hsl(var(--text-dark))]"
        >
          <IconDeviceFloppy stroke={2} />
          <span>{t("sourcing.sourcingPopup.saveAndExit")}</span>
        </Button>
      }
      onConfirm={() => {
        // TODO: Save order as draft.
        resetSourcingStore();
        router.push("/home");
      }}
      isPending={isPending}
    >
      {/* Keep spinner behavior consistent when pending */}
      {isPending ? <Spinner /> : null}
    </ActionDialog>
  );
}
