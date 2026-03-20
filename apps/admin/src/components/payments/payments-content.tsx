"use client";

import React, { useState } from "react";

import PaymentsFilters from "./payments-filters";
import PaymentsTable from "./payments-table";
import PaymentsTabs from "./payments-tabs";

export default function PaymentsContent() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [amountRange, setAmountRange] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");

  return (
    <div className="flex flex-col gap-6">
      <PaymentsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 
        The user requested to replicate the design for ALL tabs.
        So we show the filters and table regardless of the active tab.
        In a real app, we would likely filter the data passed to PaymentsTable based on activeTab.
      */}
      <div className="flex flex-col gap-4">
        <PaymentsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          amountRange={amountRange}
          onAmountRangeChange={setAmountRange}
          paymentStatus={paymentStatus}
          onPaymentStatusChange={setPaymentStatus}
        />
        <PaymentsTable
          searchQuery={searchQuery}
          amountRange={amountRange}
          paymentStatus={paymentStatus}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
