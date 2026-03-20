"use client";

import { Badge, Button, Card, CardContent } from "@cf/ui";
import { IconAlertTriangleFilled, IconChevronRight } from "@tabler/icons-react";
import React from "react";
import Flag from "react-flagkit";

export default function WalletBalanceSection() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[#F7FAF6] p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Total wallet balance
      </h2>
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* GHS Wallet */}
        <Card className="flex-1 rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-8 items-center justify-center overflow-hidden rounded bg-gray-100">
                  <Flag country="GH" className="h-6 w-8 rounded-lg" />
                </div>
                <span className="font-semibold text-gray-900">GHS</span>
              </div>
              <div className="flex flex-col items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <IconChevronRight />
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                GHS 100,000.00
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">Powered by</span>
                <div className="relative h-8 w-8">
                  {/* Affinity Logo*/}
                  <div className="absolute left-1/2 top-0 z-20 h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-br from-orange-200 via-orange-500 to-orange-900 shadow-sm" />
                  <div className="absolute bottom-0 left-1/2 z-0 h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-tr from-orange-900 via-orange-500 to-orange-200" />
                  <div className="absolute left-0 top-1/2 z-10 h-4 w-4 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-300 via-orange-500 to-orange-900" />
                  <div className="absolute right-0 top-1/2 z-30 h-4 w-4 -translate-y-1/2 rounded-full bg-gradient-to-l from-orange-200 via-orange-400 to-orange-700 shadow-md" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Affinity
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CFA Wallet */}
        <Card className="flex-1 rounded-xl border-none bg-white shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-8 items-center justify-center overflow-hidden rounded bg-gray-100">
                  <Flag country="CI" className="h-6 w-8 rounded-lg" />
                </div>
                <span className="font-semibold text-gray-500">CFA</span>
              </div>
              <div className="">
                <Badge
                  variant="outline"
                  className="flex gap-2 rounded bg-orange-100 text-orange-900"
                >
                  <IconAlertTriangleFilled size={16} className="" />
                  <span>Not available</span>
                </Badge>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-500">CFA 0.00</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
