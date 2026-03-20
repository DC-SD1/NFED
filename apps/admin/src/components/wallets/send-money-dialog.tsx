import { Button } from "@cf/ui";
import React, { useState } from "react";

import DropdownComponent from "@/components/input-components/dropdown-component";
import InputComponent from "@/components/input-components/input-component";
import AppDialog from "@/components/modals/app-dialog";
import { useModal } from "@/lib/stores/use-modal";

const RECIPIENT_TYPES = [
  { value: "agent", label: "Agent" },
  { value: "grower", label: "Grower" },
  { value: "mobile_money", label: "Mobile number" },
  { value: "bank_transfer", label: "Bank transfer" },
];

const MOBILE_NETWORKS = [
  { value: "mtn", label: "MTN" },
  { value: "vodafone", label: "Telecel (Vodafone)" },
  { value: "airteltigo", label: "AirtelTigo" },
];

export default function SendMoneyDialog() {
  const { onClose, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "SendMoney";
  const [step, setStep] = useState(1);
  const [recipientType, setRecipientType] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [mobileNetwork, setMobileNetwork] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const { onOpen } = useModal();

  return (
    <AppDialog
      isOpen={isModalOpen}
      onOpenChange={onClose}
      title={step === 3 ? "Confirm transfer" : "Send money"}
      progressValue={step === 1 ? 50 : step === 2 ? 100 : undefined}
      panelClassName={
        step === 3 ? "!max-w-[480px] !w-[480px] !h-[424px]" : undefined
      }
      content={
        <div
          className={
            step === 3
              ? "flex h-full flex-col justify-between px-8 py-0"
              : "min-h-[400px] space-y-6 px-6 py-4"
          }
        >
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Customer type
                </p>
                <DropdownComponent
                  placeholder="Select customer type"
                  options={RECIPIENT_TYPES}
                  value={recipientType}
                  onValueChange={setRecipientType}
                  className="w-full border-none bg-[#F3F6F3]"
                />
              </div>

              {recipientType === "mobile_money" && (
                <>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">
                      Mobile number
                    </p>
                    <InputComponent
                      type="tel"
                      placeholder="24 123 4567 890"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="border-none bg-[#F3F6F3]"
                      left={
                        <span className="text-sm font-semibold text-gray-900">
                          +233
                        </span>
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">
                      Mobile network
                    </p>
                    <DropdownComponent
                      placeholder="Select network"
                      options={MOBILE_NETWORKS}
                      value={mobileNetwork}
                      onValueChange={setMobileNetwork}
                      className="w-full border-none bg-[#F3F6F3]"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      className="h-12 w-full rounded-lg bg-[#A8E6A3] text-base font-semibold text-white hover:bg-[#92d68e]"
                    >
                      Add transfer amount
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : step === 2 ? (
            <div className="space-y-6">
              {/* Recipient Summary Card */}
              <div className="relative rounded-lg border border-blue-500 bg-white p-4">
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-blue-500"></div>
                <div className="mb-2 flex items-center gap-2 border-b border-dashed border-gray-200 pb-2">
                  <span className="text-sm font-bold text-gray-900">
                    Recipient
                  </span>
                  <span className="h-4 w-px bg-gray-300"></span>
                  <span className="text-sm text-gray-500">Mobile money</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Jenn Doe</h4>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      +233 {mobileNumber || "24 8912849"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="font-medium uppercase text-gray-900">
                      {mobileNetwork || "MTN"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Amount</p>
                <InputComponent
                  type="number"
                  placeholder="0.00"
                  className="border-none bg-[#F3F6F3]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Purpose Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="purpose"
                  className="text-sm font-medium text-gray-700"
                >
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  className="min-h-[80px] w-full rounded-lg border-none bg-[#F3F6F3] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setStep(3)}
                  className="h-12 w-full rounded-lg bg-[#A8E6A3] text-base font-semibold text-white hover:bg-[#92d68e]"
                >
                  Confirm payout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-4 rounded-xl bg-[#F3F6F3] px-6 py-8">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">Customer type</span>
                  <span className="text-base font-medium text-gray-900">
                    Mobile number
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">
                    Account number
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    +233 {mobileNumber || "24 123 4567 890"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">
                    Mobile network
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {MOBILE_NETWORKS.find((n) => n.value === mobileNetwork)
                      ?.label ||
                      mobileNetwork ||
                      "MTN Ghana"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">
                    Transfer amount
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    GHS {amount || "10,000.00"}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-8">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-12 flex-1 rounded-lg border-none bg-[#F3F6F3] text-base font-semibold text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    onOpen("PinConfirmation");
                  }}
                  className="h-12 flex-1 rounded-lg bg-[#36B92E] text-base font-semibold text-white hover:bg-[#2da326]"
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      }
      footer={null}
    />
  );
}
