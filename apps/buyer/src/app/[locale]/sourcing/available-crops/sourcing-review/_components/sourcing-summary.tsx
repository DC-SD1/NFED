"use client";

import { useRouter } from "@bprogress/next/app";
import { cn } from "@cf/ui";
import React from "react";

import { useSourcingStore } from "@/lib/stores/sourcing-store";
import { toTitleCase } from "@/utils/string-helpers";

import SourcingReviewAccordion from "./sourcing-summary-accordion";

export default function SourcingSummary() {
  const { goToStep, cropSpecification, shippingMethod, paymentDetails } =
    useSourcingStore();

  // TODO: Wrap in getSourcingSummary().
  const CROP_SPECIFIFCATION = cropSpecification
    ? {
        quantity: {
          isList: false,
          label: "Quantity",
          value: cropSpecification.quantity,
        },
        variety: {
          isList: false,
          label: "Variety",
          value: cropSpecification.cropVariety,
        },
        condition: { isList: false, label: "Condition", value: "Fresh" },
        grade: {
          isList: false,
          label: "Grade",
          value: cropSpecification.grade,
        },
        cultivationType: {
          isList: false,
          label: "Cultivation type",
          value: cropSpecification.cultivationType,
        },
        packagingType: {
          isList: false,
          label: "Packaging type",
          value: cropSpecification.packagingStyle,
        },
        // Not listed in cropSpecification object.
        otherSpecification: {
          isList: true,
          label: "Other specifications",
          value: [
            "Moisture 12.5 % Max",
            "Total defective grains(mouldy, shrivelled, damaged grains) 5% max",
            "Total Aflatoxins(20 pp max)",
            "Live insects - Absent",
          ],
        },
        // Currently captured as a string.
        testingType: {
          isList: true,
          label: "Testing type",
          value: [
            "Shelf life test",
            "Durability assessment",
            "Product quality inspection",
          ],
        },
        // Currently captured as a string.
        certificates: {
          isList: true,
          label: "Certificates",
          value: [
            "Non-GMO",
            "Certificate of origin",
            "Total Aflatoxins(20 pp max)",
          ],
        },
      }
    : null;

  const SHIPPING_METHOD = shippingMethod
    ? {
        method: {
          label: "Method",
          value: shippingMethod.shippingMethod
            ? shippingMethod.shippingMethod[0].toUpperCase() +
              shippingMethod.shippingMethod.slice(1)
            : "_",
        },
        airport: {
          label: "Airport of dispatch",
          value: "Kotako International Airport, Ghana",
        },
        incoterm: {
          label: "Incorterm",
          value: shippingMethod.incoterms?.toUpperCase(),
        },
        country: {
          label: "Country",
          value: shippingMethod.country,
        },
        deliveryAddress: {
          label: "Delivery address",
          value: shippingMethod?.airport,
        },
        preferredDeliveryTimeline: {
          label: "Preferred delivery timelie",
          value: shippingMethod.preferredDeliveryTimeline,
        },
      }
    : null;

  const PAYMENT_DETAILS = {
    method: {
      label: "Method",
      value: toTitleCase(paymentDetails?.paymentMethod || ""),
    },
    paymentType: {
      label: "Payment type",
      value:
        paymentDetails?.paymentType === "full"
          ? "Full payment"
          : "Installment payment",
    },
  };

  const router = useRouter();

  return (
    <div className="flex flex-col gap-y-6">
      {/* Crop specification. */}
      {CROP_SPECIFIFCATION && (
        <SourcingReviewAccordion
          title="Crop specification"
          onPressEdit={() => {
            goToStep("crop-specification", router);
          }}
        >
          <div className="rounded bg-[#F5F5F5] px-4 py-2">
            {Object.values(CROP_SPECIFIFCATION).map(
              (cropSpecification, index) => {
                return (
                  <div
                    key={index}
                    className={cn(
                      "space-y-2 py-4",
                      index !== Object.values(CROP_SPECIFIFCATION).length - 1
                        ? "border-b border-[hsl(var(--border-light))]"
                        : "",
                    )}
                  >
                    <span className="text-sm text-[#586665]">
                      {cropSpecification.label}
                    </span>
                    {!cropSpecification.isList && (
                      <p>{cropSpecification.value}</p>
                    )}

                    {cropSpecification.isList && (
                      <ul className="list-inside list-disc">
                        {(cropSpecification.value as string[]).map(
                          (item, index) => {
                            return <li key={index}>{item}</li>;
                          },
                        )}
                      </ul>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </SourcingReviewAccordion>
      )}

      {/* Shipping method. */}
      {SHIPPING_METHOD && (
        <SourcingReviewAccordion
          title="Shipping method"
          onPressEdit={async () => {
            await goToStep("shipping-method", router);
          }}
        >
          <div className="rounded bg-[#F5F5F5] px-4 py-2">
            {Object.values(SHIPPING_METHOD).map((shippingMethod, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "space-y-2 py-4",
                    index !== Object.values(SHIPPING_METHOD).length - 1
                      ? "border-b border-[hsl(var(--border-light))]"
                      : "",
                  )}
                >
                  <span className="text-sm text-[#586665]">
                    {shippingMethod.label}
                  </span>
                  <p>{shippingMethod.value}</p>
                </div>
              );
            })}
          </div>
        </SourcingReviewAccordion>
      )}

      {/* Payment details. */}
      {PAYMENT_DETAILS && (
        <SourcingReviewAccordion
          title="Payment details"
          onPressEdit={async () => {
            await goToStep("payment-details", router);
          }}
        >
          <div className="rounded bg-[#F5F5F5] px-4 py-2">
            {Object.values(PAYMENT_DETAILS).map((paymentDetail, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    "space-y-2 py-4",
                    index !== Object.values(PAYMENT_DETAILS).length - 1
                      ? "border-b border-[hsl(var(--border-light))]"
                      : "",
                  )}
                >
                  <span className="text-sm text-[#586665]">
                    {paymentDetail.label}
                  </span>
                  <p>{paymentDetail.value}</p>
                </div>
              );
            })}
            {paymentDetails?.paymentType === "installment" && (
              <div className="space-y-2 py-4">
                <span className="text-sm text-[#586665]">Payment term</span>
                <ul className="list-inside list-disc">
                  <li>Advance: {paymentDetails?.paymentTerm?.advance}%</li>
                  <li>Balance: {paymentDetails?.paymentTerm?.balance}%</li>
                </ul>
              </div>
            )}
          </div>
        </SourcingReviewAccordion>
      )}
    </div>
  );
}
