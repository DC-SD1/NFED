"use client";

import { useEffect, useState } from "react";

import EmptyStateWallet from "@/components/dashboard/empty-state-wallet";
import ReviewAndConfirmKyc from "@/components/dashboard/wallet-transaction-cards/review-and-confirm-kyc";
import WalletWelcomeCard from "@/components/dashboard/wallet-welcome-card";

export default function TransactionOverviewClient() {
  const [isActivated, setIsActivated] = useState(false);

  // TODO: API call to get necceary information

  useEffect(() => {
    setIsActivated(false);
  }, []);

  return !isActivated ? (
    <ReviewAndConfirmKyc />
  ) : (
    <div className="px-10">
      <WalletWelcomeCard />
      <EmptyStateWallet />
    </div>
  );
}
