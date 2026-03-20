import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@cf/ui";
import React, { useState } from "react";

import AppDialog from "@/components/modals/app-dialog";
import { useModal } from "@/lib/stores/use-modal";

export default function PinConfirmationDialog() {
  const { onClose, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "PinConfirmation";
  const [pin, setPin] = useState("");

  return (
    <AppDialog
      isOpen={isModalOpen}
      onOpenChange={onClose}
      title="Enter your pin to confirm this transfer"
      panelClassName="!max-w-[480px] !w-[480px] !h-[252px]"
      content={
        <div className="flex h-full w-full flex-col justify-between gap-6 p-8">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-12 w-12 rounded-lg bg-[#F3F6F3] text-lg font-semibold shadow-none"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex w-full gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 flex-1 rounded-lg border-none bg-[#F3F6F3] text-base font-semibold text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              disabled={pin.length !== 6}
              onClick={() => {
                console.log("Transfer Confirmed with PIN:", pin);
                onClose();
              }}
              className="h-12 flex-1 rounded-lg bg-[#36B92E] text-base font-semibold text-white hover:bg-[#2da326] disabled:opacity-50"
            >
              Continue
            </Button>
          </div>
        </div>
      }
      footer={null}
    />
  );
}
