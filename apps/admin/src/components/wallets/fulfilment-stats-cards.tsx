"use client";

import { Card, CardContent } from "@cf/ui";
import {
  IconChartPie,
  IconCurrencyDollar,
  IconWallet,
} from "@tabler/icons-react";
import React from "react";

export default function FulfilmentStatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Total number of wallets */}
      <Card className="rounded-xl border border-[#E8F3E5] bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-[#E8F3E5] p-2 text-[#1A5514]">
                <IconWallet size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Total number of wallets
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">6</h3>
          </div>
        </CardContent>
      </Card>

      {/* Wallets status */}
      <Card className="rounded-xl border border-purple-100 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-500">
                <IconChartPie size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Wallets status
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500">Frozen</p>
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total wallet balance */}
      <Card className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-500">
                <IconCurrencyDollar size={20} />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Total wallet balance
              </span>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-gray-500">GHS</p>
                <p className="text-lg font-bold text-gray-900">100,000.00</p>
              </div>
              <div className="h-8 w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500">CFA</p>
                <p className="text-lg font-bold text-gray-900">100,000.00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
