import { Button, Checkbox } from "@cf/ui";
import React from "react";

import { useModal } from "@/lib/stores/use-modal";

interface FarmingAgreementCardProps {
  title?: string;
  subtitle?: string;
  farmer?: string;
  crop?: string;
  area?: string;
  contractValue?: string;
  inputSupport?: string;
  paymentTerms?: string;
  qualityStandards?: string;
  deliveryDate?: string;
  isAgreed?: boolean;
  termsLink?: string;
  nextPageUrl: string;
  onAgreementChange?: () => void;
}

export interface FarmingContract {
  farmer: string;
  crop: string;
  area: string;
  contractValue: string;
  inputSupport: string;
  paymentTerms: string;
  qualityStandards: string;
  deliveryDate: string;
}

const FarmingAgreementCard = ({
  title = "Farming agreement",
  subtitle = "Review and sign the farming contract",
  farmer = "John Mwangi",
  crop = "Chili pepper",
  area = "2.5 acres, Field A",
  contractValue = "GHS3,125",
  inputSupport = "Seeds, fertilizer, and technical support provided",
  paymentTerms = "70% on delivery, 30% within 14 days",
  qualityStandards = "Grade 1, max 14% moisture",
  deliveryDate = "19 Nov 2025",
  nextPageUrl = "",
  isAgreed = false,
  onAgreementChange = () => {
    //
  },
}: FarmingAgreementCardProps) => {
  const { onOpen } = useModal();

  const handleTermsClick = () => {
    onOpen("TermsAndConditions", {
      termsAndConditionsBtnText: "Sign the contract",
      termsAndConditionsLink: nextPageUrl,
    });
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 font-sans shadow-xl">
      {/* Header */}
      <div className="mb-2">
        <h3 className="mb-2 text-base font-semibold">{title}</h3>
        <p className="text-gray-dark text-sm">{subtitle}</p>
      </div>

      {/* Contract Terms Summary */}
      <div className="border-input-border bg-container mb-6 rounded-lg border p-4">
        <h1 className="mb-3 text-sm  font-semibold">Contract terms summary</h1>

        <div className="text-gray-dark space-y-1 text-sm">
          <div className="break-words">
            <span className="text-black">Farmer: </span>
            {farmer}
          </div>
          <div className="break-words">
            <span className="text-black">Crop: </span>
            {crop}
          </div>
          <div className="break-words">
            <span className="text-black">Area: </span>
            {area}
          </div>
          <div className="break-words">
            <span className="text-black">Contract Value: </span>
            {contractValue}
          </div>
          <div className="break-words">
            <span className="text-black">Input Support: </span>
            {inputSupport}
          </div>
          <div className="break-words">
            <span className="text-black">Payment Terms: </span>
            {paymentTerms}
          </div>
          <div className="break-words">
            <span className="text-black">Quality Standards: </span>
            {qualityStandards}
          </div>
          <div className="break-words">
            <span className="text-black">Delivery Date: </span>
            {deliveryDate}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3">
        <Checkbox
          id="agreement"
          checked={isAgreed}
          onCheckedChange={onAgreementChange}
          className="text-primary focus:ring-primary mt-1 size-4 rounded border-gray-300"
        />
        <label
          htmlFor="agreement"
          className="cursor-pointer break-words text-sm text-gray-700"
        >
          I have read and agree to the{" "}
          <Button
            variant="unstyled"
            className="text-primary h-0 p-0 font-medium  hover:underline"
            onClick={handleTermsClick}
          >
            terms and conditions
          </Button>
        </label>
      </div>
    </div>
  );
};

export default FarmingAgreementCard;
