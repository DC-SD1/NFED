"use client";

import { Form, Label } from "@cf/ui";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import BankTransferImage from "@/assets/images/sourcing/bank.png";
import CashAgainstDocumentImage from "@/assets/images/sourcing/dac.png";
import EscrowImage from "@/assets/images/sourcing/escrow.png";
import LetterOfCredit from "@/assets/images/sourcing/loc.png";
import TradeFinanceImage from "@/assets/images/sourcing/trade-finance.png";
import { RadioField } from "@/components/forms/radio-field";
import { SliderForm } from "@/components/forms/slider-form";
import { useSourcingStore } from "@/lib/stores/sourcing-store";

const preferredPayments = [
  {
    label: "Escrow",
    value: "escrow",
    image: EscrowImage.src,
    width: 107,
    height: 76,
  },
  {
    label: "Letter of Credit",
    value: "letter of credit",
    image: LetterOfCredit.src,
    width: 85,
    height: 89,
  },
];

const otherPaymentOptions = [
  {
    label: "Bank transfer",
    value: "bank transfer",
    image: BankTransferImage.src,
    width: 70,
    height: 59,
  },
  {
    label: "Cash against document",
    value: "cash against document",
    image: CashAgainstDocumentImage.src,
    width: 134,
    height: 67,
  },
  {
    label: "Trade finance",
    value: "trade finance",
    image: TradeFinanceImage.src,
    width: 90,
    height: 66,
  },
];

export function PaymentDetailsForm() {
  const {
    paymentDetails,
    savePaymentDetails,
    setCurrentStepValid,
    isPaymentDetailsValid,
  } = useSourcingStore();

  const form = useForm({
    defaultValues: {
      paymentMethod: paymentDetails?.paymentMethod || "",
      paymentType:
        paymentDetails?.paymentType === "full"
          ? "full payment"
          : paymentDetails?.paymentType === "installment"
            ? "installment payment"
            : "",
      paymentTerms: [
        paymentDetails?.paymentTerm?.advance
          ? Number(paymentDetails.paymentTerm.advance)
          : 30,
      ],
    },
    mode: "onChange",
  });

  const { watch } = form;
  const selectedPaymentMethod = watch("paymentMethod");
  const selectedPaymentType = watch("paymentType");
  const paymentTerms = watch("paymentTerms")?.[0] || 30;

  // Calculate advance and balance percentages
  const advancePercentage = paymentTerms;
  const balancePercentage = 100 - paymentTerms;

  const previousFormDataRef = useRef<string>("");

  const currentData = useMemo(() => {
    const normalizedType: "full" | "installment" | undefined =
      selectedPaymentType === "full payment"
        ? "full"
        : selectedPaymentType === "installment payment"
          ? "installment"
          : undefined;

    return {
      paymentMethod: selectedPaymentMethod,
      paymentType: normalizedType,
      paymentTerm: {
        advance: String(advancePercentage),
        balance: String(balancePercentage),
      },
    };
  }, [
    selectedPaymentMethod,
    selectedPaymentType,
    advancePercentage,
    balancePercentage,
  ]);

  // Memoize the validation function
  const validateAndSave = useCallback(() => {
    const formDataString = JSON.stringify(currentData);

    if (previousFormDataRef.current === formDataString) return;
    previousFormDataRef.current = formDataString;

    const valid = isPaymentDetailsValid(currentData);
    setCurrentStepValid(valid);
    if (valid) savePaymentDetails(currentData as any);
  }, [
    currentData,
    isPaymentDetailsValid,
    savePaymentDetails,
    setCurrentStepValid,
  ]);

  // Real-time validation and auto-save with explicit field dependencies
  useEffect(() => {
    validateAndSave();
  }, [
    validateAndSave,
    selectedPaymentMethod,
    selectedPaymentType,
    advancePercentage,
    balancePercentage,
  ]);

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="space-y-4">
          <RadioField
            name="paymentMethod"
            label="PREFERRED PAYMENT METHOD"
            options={preferredPayments}
            isTop={false}
            isMiddle={true}
          />
          <RadioField
            name="paymentMethod"
            label="OTHER PAYMENT METHOD"
            options={otherPaymentOptions}
            isTop={false}
            isMiddle={true}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xl font-bold">Payment type</Label>
            <p className="text-muted-foreground text-sm">
              Please select one payment type
            </p>
          </div>

          <RadioField
            name="paymentType"
            label=""
            options={[
              { label: "Full payment", value: "full payment" },
              { label: "Installment payment", value: "installment payment" },
            ]}
            size="compact"
            isTop={false}
          />
        </div>

        {selectedPaymentType === "installment payment" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xl font-bold">Payment terms</Label>
              <p className="text-muted-foreground text-sm">
                Please select one payment type
              </p>
            </div>

            <div className="flex h-[44px] items-center rounded-xl bg-[#D5E3FD] px-4 text-[#00439E]">
              <IconInfoCircleFilled />
              <p className="text-sm">
                The advance payment can&apos;t be less than 30% of the initial
                total cost.
              </p>
            </div>

            <SliderForm name="paymentTerms" label="" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-[48px] w-[144px] items-center justify-center gap-4 rounded-xl border border-[hsl(var(--border-light))]">
                  <p>Advance</p>
                  <p className="font-bold">{advancePercentage}%</p>
                </div>
                <div className="flex h-[48px] w-[136px] items-center justify-center gap-4 rounded-xl border border-[hsl(var(--border-light))]">
                  <p>Balance</p>
                  <p className="font-bold">{balancePercentage}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
