import { Button, Dialog, DialogContent, DialogHeader } from "@cf/ui";
import { IconDownload, IconX } from "@tabler/icons-react";
import React from "react";

interface DashboardExportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export default function DashboardExportPreviewDialog({
  isOpen,
  onClose,
  onExport,
}: DashboardExportPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex h-[90vh] flex-col gap-0 p-0 sm:max-w-[800px]"
        closeClassName="hidden"
      >
        <DialogHeader className="relative flex flex-row items-center justify-between border-b p-4 px-6">
          <button
            onClick={onClose}
            className="text-gray-500 outline-none hover:text-gray-700"
          >
            <IconX size={20} />
          </button>

          <div className="text-black-500 absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wider">
            Preview report
          </div>

          <Button
            className="gap-2 bg-[#36B92E] px-4 text-white hover:bg-[#2da026]"
            onClick={onExport}
          >
            <IconDownload size={18} />
            Export report
          </Button>
        </DialogHeader>

        <div className="flex flex-1 justify-center overflow-y-auto bg-gray-50 p-8">
          <div className="flex w-full max-w-[800px] flex-col gap-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#36B92E]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold leading-none text-gray-800">
                    complete
                  </span>
                  <span className="text-2xl font-bold leading-none text-gray-800">
                    farmer
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right text-[10px] text-gray-600">
                <p className="text-xs font-bold text-gray-900">
                  Complete Farmer Limited – Ghana
                </p>
                <p>11 Molade-Akiwumi Street, Accra,</p>
                <p>Greater Accra 00233, GHANA</p>
                <br />
                <p>+233556710427</p>
                <p>accounts@completefarmer.com</p>
                <p>www.completefarmer.com</p>
              </div>
            </div>

            {/* Report Info */}
            <div>
              <h2 className="text-sm font-bold text-gray-900">Report</h2>
              <p className="mt-1 text-xs text-gray-500">
                1 Oct 2025 – 31 Oct 2025
              </p>
            </div>

            {/* Wallet Balance Section */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h3 className="mb-3 text-xs font-bold text-gray-900">
                Total wallet balance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">🇬🇭</span>
                    <span className="text-xs font-bold text-gray-700">GHS</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    GHS 100,000.00
                  </div>
                  <div className="mt-1 inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                    -20%
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">🇨🇮</span>
                    <span className="text-xs font-bold text-gray-700">CFA</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    CFA 100,000.00
                  </div>
                  <div className="mt-1 inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                    -20%
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Chart Section */}
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-4">
                  <span className="text-xs font-bold text-gray-900">
                    Transactions
                  </span>
                  <span className="text-xs font-medium text-gray-500">GHS</span>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[10px] text-gray-500">
                      Total transactions
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      GHS 200,000.00
                    </p>
                    <p className="text-[10px] text-gray-400">Count 165</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-end gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <p className="text-[10px] text-gray-500">Inflows</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      GHS 120,000.00
                    </p>
                    <p className="text-[10px] text-gray-400">Count 90</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-end gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <p className="text-[10px] text-gray-500">Outflows</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      GHS 80,000.00
                    </p>
                    <p className="text-[10px] text-gray-400">Count 180</p>
                  </div>
                </div>
              </div>
              {/* Mock Line Chart */}
              <div className="relative mt-4 h-40 w-full">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-px w-full border-t border-dashed border-gray-100 bg-gray-50"
                    ></div>
                  ))}
                </div>
                {/* Mock Lines (SVG) */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 80 C 40 80, 80 120, 120 100 S 200 60, 280 80 S 360 100, 440 80 S 520 60, 600 70"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M0 100 C 40 90, 80 80, 120 90 S 200 120, 280 100 S 360 80, 440 90 S 520 100, 600 110"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                </svg>
                {/* X Axis Labels */}
                <div className="absolute bottom-0 flex w-full justify-between pt-2 text-[8px] text-gray-400">
                  <span>JAN</span>
                  <span>FEB</span>
                  <span>MAR</span>
                  <span>APR</span>
                  <span>MAY</span>
                  <span>JUN</span>
                  <span>JUL</span>
                  <span>AUG</span>
                  <span>SEP</span>
                  <span>OCT</span>
                </div>
                {/* Tooltip Mock */}
                <div className="absolute left-[35%] top-[20%] z-10 rounded border border-gray-100 bg-white p-2 text-[10px] shadow-lg">
                  <p className="mb-1 font-bold text-gray-900">April</p>
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-green-500"></div>
                    <span className="text-gray-500">Inflows</span>
                    <span className="ml-auto font-medium">GHS 50,000.00</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-red-500"></div>
                    <span className="text-gray-500">Outflows</span>
                    <span className="ml-auto font-medium">GHS 25,000.00</span>
                  </div>
                </div>
                <div className="pointer-events-none absolute bottom-0 left-[35%] top-0 w-px border-l border-dashed border-green-300"></div>
              </div>
            </div>

            {/* Donut Charts Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fund Request Status */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Fund request status
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    GHS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg
                      viewBox="0 0 36 36"
                      className="h-full w-full -rotate-90"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeDasharray="60, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#eab308"
                        strokeWidth="8"
                        strokeDasharray="25, 100"
                        strokeDashoffset="-60"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="8"
                        strokeDasharray="15, 100"
                        strokeDashoffset="-85"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 text-[8px]">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-500">Pending</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">10</div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-gray-500">Approved</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">100</div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span className="text-gray-500">Rejected</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">20</div>
                  </div>
                </div>
              </div>

              {/* Fund Utilization */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Fund utilization
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    GHS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg
                      viewBox="0 0 36 36"
                      className="h-full w-full -rotate-90"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeDasharray="70, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="8"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-70"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 text-[8px]">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-gray-500">Allocated</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 20,000.00
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600"></div>
                      <span className="text-gray-500">Spent</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 40,000.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Funding Sources */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Funding sources
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    GHS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg
                      viewBox="0 0 36 36"
                      className="h-full w-full -rotate-90"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#064e3b"
                        strokeWidth="8"
                        strokeDasharray="40, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeDasharray="40, 100"
                        strokeDashoffset="-40"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#86efac"
                        strokeWidth="8"
                        strokeDasharray="20, 100"
                        strokeDashoffset="-80"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 text-[8px]">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-900"></div>
                      <span className="text-gray-500">Platform Fund</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 80,000.00
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-gray-500">Finance Admin</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 100,000.00
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-200"></div>
                      <span className="text-gray-500">Buyer Payment</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 20,000.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Destinations */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Transfer destinations
                  </span>
                  <span className="text-[10px] font-medium text-gray-500">
                    GHS
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg
                      viewBox="0 0 36 36"
                      className="h-full w-full -rotate-90"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#bbf7d0"
                        strokeWidth="8"
                        strokeDasharray="20, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeDasharray="50, 100"
                        strokeDashoffset="-20"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#15803d"
                        strokeWidth="8"
                        strokeDasharray="30, 100"
                        strokeDashoffset="-70"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 text-[8px]">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-200"></div>
                      <span className="text-gray-500">Agent</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 20,000.00
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-gray-500">Grower</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 80,000.00
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-700"></div>
                      <span className="text-gray-500">Mobile number</span>
                    </div>
                    <div className="pl-2.5 font-bold text-gray-900">
                      GHS 70,000.00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-between border-t border-gray-100 pt-8 text-[10px] text-gray-400">
              <p>
                Generated by <span className="text-gray-600">John Doe</span> |
                14 Nov 2025
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
