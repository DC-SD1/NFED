"use client";

import {
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@cf/ui/components/table";
import {
  IconCirclePlus,
  IconDots,
  IconInfoCircle,
  IconPencil,
} from "@tabler/icons-react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React from "react";

import { showSuccessToast } from "@/lib/utils/toast";

import PaymentDetailsSheet from "./payment-details-sheet";
import RecordPaymentDialog from "./record-payment-dialog";

const MOCK_DATA = [
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "New",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "30% paid",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "30% paid",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "New",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "Fully paid",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "New",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 2,000,000",
    amount: "USD 2,000,000",
    status: "New",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "New",
  },
  {
    orderId: "ORD-001",
    date: "23 Oct 2025",
    buyer: "GreenHarvest Co.",
    buyerId: "BYR-001-11",
    orderType: "Available",
    crops: "Chilli Pepper",
    variety: "Red Bird's Eye",
    quantity: "10,000 MT",
    quantityValue: "USD 4.2M",
    amount: "USD 2,000,000",
    status: "New",
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  let styles = "bg-gray-100 text-gray-800";
  let dotColor = "bg-gray-500";

  switch (status) {
    case "New":
      styles = "bg-[#F0F2EE] text-gray-700";
      dotColor = "bg-red-500";
      break;
    case "30% paid":
      styles = "bg-blue-100 text-blue-700";
      dotColor = "bg-red-500";
      break;
    case "Fully paid":
      styles = "bg-green-100 text-green-700";
      dotColor = ""; // No dot for fully paid in design
      break;
  }

  return (
    <div
      className={`flex w-fit items-center gap-2 rounded px-2 py-1 text-xs font-medium ${styles}`}
    >
      {dotColor && <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {status}
    </div>
  );
};

export default function PaymentsTable({
  searchQuery,
  amountRange,
  paymentStatus: paymentStatusFilter,
  activeTab: _activeTab,
}: {
  searchQuery: string;
  amountRange: string;
  paymentStatus: string;
  activeTab: string;
}) {
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = React.useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState<
    "verified" | "rejected" | null
  >(null);
  const [rejectionReason, setRejectionReason] = React.useState<string>("");

  const handlePaymentVerified = () => {
    setIsRecordPaymentOpen(false);
    setPaymentStatus("verified");
    setIsPaymentDetailsOpen(true);
    showSuccessToast("Order payment has been verified");
  };

  const handlePaymentRejected = (reason: string) => {
    setIsRecordPaymentOpen(false);
    setPaymentStatus("rejected");
    setRejectionReason(reason);
    setIsPaymentDetailsOpen(true);
    showSuccessToast("Payment rejected");
  };

  const handleRecordPayment = () => {
    setIsRecordPaymentOpen(true);
  };

  const filteredData = React.useMemo(() => {
    return MOCK_DATA.filter((item) => {
      // 1. Search by buyer name
      if (
        searchQuery &&
        !item.buyer.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // 2. Filter by Payment Status
      if (
        paymentStatusFilter !== "all" &&
        item.status !== paymentStatusFilter
      ) {
        return false;
      }

      // 3. Filter by Amount Range
      if (amountRange !== "all") {
        const amountStr = item.amount.replace(/[^0-9.]/g, "");
        const amount = parseFloat(amountStr);

        if (amountRange === "0-1M") {
          return amount < 1000000;
        }
        if (amountRange === "1M-5M") {
          return amount >= 1000000 && amount < 5000000;
        }
        if (amountRange === "5M+") {
          return amount >= 5000000;
        }
      }

      // 4. Tab filtering (Optional based on available data)
      // If we had a paymentMethod field, we would filter here.
      // For now, we assume all data belongs to the active tab or ignore it.

      return true;
    });
  }, [searchQuery, amountRange, paymentStatusFilter]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox className="border-gray-300 bg-white" />
            </TableHead>
            <TableHead className="font-bold text-gray-900">Order ID</TableHead>
            <TableHead className="font-bold text-gray-900">Buyer</TableHead>
            <TableHead className="font-bold text-gray-900">
              Order type
            </TableHead>
            <TableHead className="font-bold text-gray-900">Crops</TableHead>
            <TableHead className="font-bold text-gray-900">
              Quantity(MT)
            </TableHead>
            <TableHead className="font-bold text-gray-900">Amount</TableHead>
            <TableHead className="font-bold text-gray-900">
              Payment status
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox className="border-gray-300 bg-white" />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {row.orderId}
                    </span>
                    <span className="text-xs text-gray-500">{row.date}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {row.buyer}
                    </span>
                    <span className="text-xs text-gray-500">{row.buyerId}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">{row.orderType}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {row.crops}
                    </span>
                    <span className="text-xs text-gray-500">{row.variety}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {row.quantity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {row.quantityValue}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {row.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 outline-none hover:text-gray-600">
                        <IconDots size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      {row.status === "New" ? (
                        <DropdownMenuItem
                          className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                          onClick={handleRecordPayment}
                        >
                          <IconCirclePlus size={18} className="text-gray-900" />
                          <span className="text-sm font-medium text-gray-900">
                            Record payment
                          </span>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                            onClick={() => setIsPaymentDetailsOpen(true)}
                          >
                            <IconInfoCircle
                              size={18}
                              className="text-gray-900"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              View detail
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex cursor-not-allowed items-center gap-2 rounded-md p-2 opacity-50"
                            disabled
                          >
                            <IconCirclePlus
                              size={18}
                              className="text-gray-400"
                            />
                            <span className="text-sm font-medium text-gray-400">
                              Record payment
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                            onClick={handleRecordPayment}
                          >
                            <IconPencil size={18} className="text-gray-900" />
                            <span className="text-sm font-medium text-gray-900">
                              Update record
                            </span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 p-4">
        <span className="text-sm text-gray-500">0 of 68 row(s) selected.</span>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page</span>
            <div className="flex w-16 items-center justify-between rounded border border-gray-200 px-2 py-1 text-sm">
              10
              <IconChevronDown size={14} className="text-gray-500" />
            </div>
          </div>

          <span className="text-sm font-medium text-gray-900">Page 1 of 7</span>

          <div className="flex gap-2">
            <button className="rounded border border-gray-200 p-1 hover:bg-gray-50 disabled:opacity-50">
              <IconChevronLeft size={16} className="text-gray-500" />
            </button>
            <button className="rounded border border-gray-200 p-1 hover:bg-gray-50">
              <IconChevronLeft size={16} className="rotate-180 text-gray-500" />{" "}
              {/* Double arrow hack or import IconChevronsRight */}
            </button>
            <button className="rounded border border-gray-200 p-1 hover:bg-gray-50">
              <IconChevronRight size={16} className="text-gray-500" />
            </button>
            <button className="rounded border border-gray-200 p-1 hover:bg-gray-50">
              <IconChevronRight size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <RecordPaymentDialog
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onPaymentVerified={handlePaymentVerified}
        onPaymentRejected={handlePaymentRejected}
      />
      <PaymentDetailsSheet
        isOpen={isPaymentDetailsOpen}
        onClose={() => setIsPaymentDetailsOpen(false)}
        status={paymentStatus}
        rejectionReason={rejectionReason}
      />
    </div>
  );
}

// Helper for pagination icons if needed, or just use standard icons
import { IconChevronDown } from "@tabler/icons-react";
