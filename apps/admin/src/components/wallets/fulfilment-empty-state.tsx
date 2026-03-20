"use client";

import { IconWallet } from "@tabler/icons-react";
import React from "react";

export default function FulfilmentEmptyState() {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        {/* Placeholder for the illustration using icons */}
        <div className="flex items-center justify-center">
          <IconWallet size={120} className="text-[#3CB371]" stroke={1} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900">No wallets available</h3>
      <p className="mt-2 text-sm text-gray-500">
        All wallets will be displayed when available
      </p>
    </div>
  );
}
