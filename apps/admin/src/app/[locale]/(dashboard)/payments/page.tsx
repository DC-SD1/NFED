import { Button } from "@cf/ui";
import { IconDownload } from "@tabler/icons-react";
import React from "react";

import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import PaymentsContent from "@/components/payments/payments-content";
import PaymentsStats from "@/components/payments/payments-stats";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6 px-8 pb-8">
      <AppTitleToolBar
        title="Buyer order payments"
        toolBar={
          <Button
            variant="outline"
            className="gap-2 border-none bg-[#F3F4F1] text-gray-700 hover:bg-[#e5e7eb]"
          >
            <IconDownload size={18} />
            Export
          </Button>
        }
      />

      <PaymentsStats />

      <PaymentsContent />
    </div>
  );
}
