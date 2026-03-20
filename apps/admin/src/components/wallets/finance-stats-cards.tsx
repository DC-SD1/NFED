"use client";

import { Card, CardContent } from "@cf/ui";
import { IconClock, IconTransfer, IconWallet } from "@tabler/icons-react";
import React from "react";

export default function FinanceStatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Total disbursement */}
      <Card className="rounded-xl border border-[#E8F3E5] bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#E8F3E5] p-2 text-[#1A5514]">
                <IconWallet size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Total disbursement
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">GHS 100,000.00</h3>
            <span className="mt-1 inline-block rounded bg-[#F3F6F3] px-2 py-0.5 text-xs font-medium text-gray-600">
              Last updated: 11:34 AM
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pending disbursement */}
      <Card className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <IconClock size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Pending disbursement
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">GHS 20,000.00</h3>
            <span className="mt-1 inline-block rounded bg-[#F3F6F3] px-2 py-0.5 text-xs font-medium text-gray-600">
              11 pending disbursements
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transfer status */}
      <Card className="rounded-xl border border-purple-100 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-500">
                <IconTransfer size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Transfer status
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500">Disbursed</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500">Failed</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
