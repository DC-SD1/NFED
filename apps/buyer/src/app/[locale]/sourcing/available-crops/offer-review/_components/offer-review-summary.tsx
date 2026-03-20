import { Accordion } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";

const convertToCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS", // Change to your currency (e.g., 'EUR', 'NGN', etc.)
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

import OfferReviewAccordionItem from "./offer-review-accordion-item";
import OfferReviewItemCard from "./offer-review-item-card";

const OFFER_REVIEW = {
  farmgatePrice: {
    unitPrice: 5000,
    quantity: 120,
    totalCost: 600000,
  },
  warehouseServices: {
    totalCost: 1800,
    costBreakdown: [
      { item: "Service 1", cost: 1000 },
      { item: "Service 2", cost: 800 },
    ],
  },
  tests: {
    totalCost: 600,
    costBreakdown: [
      { item: "Shelf life test", cost: 400 },
      { item: "Product quality inspection", cost: 200 },
    ],
  },
  packaging: {
    totalCost: 4000,
    costBreakdown: [
      { item: "3kg cardboard boxes", costPerItem: 100, quantity: 40 },
    ],
  },
  freightCost: {
    totalCost: 700,
    costBreakdown: [
      { item: "FOB, Country", cost: 500 },
      { item: "Additional cost", cost: 200 },
    ],
  },
  taxImplication: {
    totalCost: 400,
    costBreakdown: [{ item: "Compound taxes", cost: 400 }],
  },
  totalCost: 607500,
};

export default function OfferReviewSummary() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        className="w-full space-y-6"
        // defaultValue="farmgate-price"
      >
        {/* Farmgate price. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.farmgatePrice")}
          totalCost={OFFER_REVIEW.farmgatePrice.totalCost}
        >
          <>
            <OfferReviewItemCard
              label="Unit price"
              value={convertToCurrency(OFFER_REVIEW.farmgatePrice.unitPrice)}
            />
            <OfferReviewItemCard
              label="Quanitity"
              value={`${OFFER_REVIEW.farmgatePrice.quantity}MT`}
            />
          </>
        </OfferReviewAccordionItem>

        {/* Warehouse services. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.warehouseServices")}
          totalCost={OFFER_REVIEW.warehouseServices.totalCost}
        >
          {OFFER_REVIEW.warehouseServices.costBreakdown.map((item, index) => {
            return (
              <div
                key={index}
                className="flex w-full flex-row justify-between py-4"
              >
                <span className="inline-block">{item.item}</span>
                <span className="inline-block">
                  {convertToCurrency(item.cost)}
                </span>
              </div>
            );
          })}
        </OfferReviewAccordionItem>

        {/* Tests. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.tests")}
          totalCost={OFFER_REVIEW.tests.totalCost}
        >
          {OFFER_REVIEW.tests.costBreakdown.map((item, index) => {
            return (
              <div
                key={index}
                className="flex w-full flex-row justify-between py-4"
              >
                <span className="inline-block">{item.item}</span>
                <span className="inline-block">
                  {convertToCurrency(item.cost)}
                </span>
              </div>
            );
          })}
        </OfferReviewAccordionItem>

        {/* Packaging. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.packagaing")}
          totalCost={OFFER_REVIEW.packaging.totalCost}
        >
          {OFFER_REVIEW.packaging.costBreakdown.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <OfferReviewItemCard
                  label={item.item}
                  value={convertToCurrency(item.costPerItem)}
                />
                <OfferReviewItemCard label="Quanitity" value={item.quantity} />
              </React.Fragment>
            );
          })}
        </OfferReviewAccordionItem>

        {/* Freight cost. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.freightCost")}
          totalCost={OFFER_REVIEW.freightCost.totalCost}
        >
          {OFFER_REVIEW.freightCost.costBreakdown.map((item, index) => {
            return (
              <div
                key={index}
                className="flex w-full flex-row justify-between py-4"
              >
                <span className="inline-block">{item.item}</span>
                <span className="inline-block">
                  {convertToCurrency(item.cost)}
                </span>
              </div>
            );
          })}
        </OfferReviewAccordionItem>

        {/* Tax implication. */}
        <OfferReviewAccordionItem
          label={t("sourcing.offerReview.summary.taxImplication")}
          totalCost={OFFER_REVIEW.taxImplication.totalCost}
        >
          {OFFER_REVIEW.taxImplication.costBreakdown.map((item, index) => {
            return (
              <div
                key={index}
                className="flex w-full flex-row justify-between py-4"
              >
                <span className="inline-block">{item.item}</span>
                <span className="inline-block">
                  {convertToCurrency(item.cost)}
                </span>
              </div>
            );
          })}
        </OfferReviewAccordionItem>
      </Accordion>

      {/* Total Cost */}
      <div className="flex flex-1 flex-row justify-between rounded-xl border-none bg-[#F5F5F5] px-6 py-6 text-xl font-bold">
        <span>Total cost</span>
        <span>{convertToCurrency(OFFER_REVIEW.totalCost)}</span>
      </div>
    </div>
  );
}
