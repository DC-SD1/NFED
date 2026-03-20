"use client";

import StatisticsCard from "@/components/dashboard/statistics/statistics-card";
import { DetailSheet } from "@/components/dashboard/statistics/statistics-details";
import StatisticsFilter from "@/components/dashboard/statistics/statistics-filter";
import StatisticsTable from "@/components/dashboard/statistics/statistics-table";
import StatusBadge from "@/components/dashboard/statistics/status-badge";
import { Column, Invoice } from "@/components/dashboard/statistics/types/tables";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@cf/ui";
import { IconCash, IconDownload, IconListDetails, IconLoader, IconReceipt, IconReload } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";

export const statsData = [
  {
    title: "Outstanding invoices",
    value: "$1.26M",
    badge: null,
    icon: IconLoader,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "DSO (Days Sales Outstanding)",
    value: "42 days",
    badge: null,
    icon: IconReceipt,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Payout due this week",
    value: "Ghs 320k",
    badge: null,
    icon: IconCash,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Refunds in queue",
    value: "$1,200",
    badge: null,
    info: "12 requests",
    icon: IconListDetails,
    bgColor: "bg-[#FEF0D8]",
    iconColor: "text-[#995917]",
  },
];

const invoiceColumns: Column<Invoice>[] = [
  {
    id: "invoiceId",
    label: "Invoice ID",
    render: (row) => row.invoiceId,
  },
  {
    id: "buyer",
    label: "User Type",
    render: (row) => row.buyer,
  },
  {
    id: "amount",
    label: "Amount",
    align: "right",
    render: (row) => row.amount,
  },
  {
    id: "submittedOn",
    label: "Submitted On",
    render: (row) => row.submittedOn,
  },
  {
    id: "status",
    label: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const mockInvoices: Invoice[] = [
  {
    invoiceId: "INV-4432",
    buyer: "AgroTrade BV",
    amount: "$4,500",
    submittedOn: "Jul 10",
    status: "Overdue",
  },
  {
    invoiceId: "INV-4433",
    buyer: "NextGen Robotics",
    amount: "$55,300",
    submittedOn: "Jul 25",
    status: "Paid",
  },
  {
    invoiceId: "INV-4439",
    buyer: "HealthTech Inovations",
    amount: "$62,150",
    submittedOn: "Aug 05",
    status: "Paid",
  },
  {
    invoiceId: "INV-4441",
    buyer: "AutoDrive Technologies",
    amount: "$72,900",
    submittedOn: "Oct 01",
    status: "Paid",
  },
  {
    invoiceId: "INV-4436",
    buyer: "Creative Media Group",
    amount: "$15,00",
    submittedOn: "Jul 15",
    status: "Overdue",
  },
  {
    invoiceId: "INV-4440",
    buyer: "Smart Home Appliances",
    amount: "$38,600",
    submittedOn: "Sep 12",
    status: "Paid",
  },
  {
    invoiceId: "INV-4438",
    buyer: "Eco-Future Solutions",
    amount: "$47,800",
    submittedOn: "Jul 10",
    status: "Pending",
  },
  {
    invoiceId: "INV-4442",
    buyer: "AgroTrade BV",
    amount: "$4,500",
    submittedOn: "Jul 10",
    status: "Overdue",
  },
];
const AllInvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [amountRange, setAmountRange] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false)

  const itemsPerPage = 10;

  // Filter logic (can be extracted later if needed)
  const filteredData = useMemo(() => {
    return mockInvoices.filter((item) => {
      const searchMatch =
        item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyer.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === "All" || item.status === statusFilter;

      const amountNum = parseInt(item.amount.replace(/[^\d]/g, ""), 10);
      let amountMatch = true;
      if (amountRange === "0-1000") amountMatch = amountNum <= 1000;
      else if (amountRange === "1000-5000") amountMatch = amountNum > 1000 && amountNum <= 5000;
      else if (amountRange === "5000+") amountMatch = amountNum > 5000;

      return searchMatch && statusMatch && amountMatch;
    });
  }, [searchTerm, amountRange, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="flex flex-col px-2 px-8 pb-8">
      <div className="m-2 flex items-center justify-between gap-2">
        <Breadcrumb className="mt-10 md:mt-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="font-bold text-green-500 hover:text-emerald-600"
              >
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>All invoices</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-xs text-gray-400">Last update 10 mins ago</span>
          <Button
            variant="outline"
            size="icon"
            className="w-10 border-none bg-[#F3F4F1] px-0"
          >
            <IconReload size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-fit gap-2 border-none bg-[#F3F4F1] px-2"
          >
            <IconDownload size={18} />
            <span>Export</span>
          </Button>
        </div>
      </div>
      <AppTitleToolBar title={"All refunds"} />

      <StatisticsFilter />

      <StatisticsCard statsData={statsData} />

      {/* Filters – now controlled from page */}
      {/* <TableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        amountRange={amountRange}
        setAmountRange={setAmountRange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      /> */}

      {/* Reusable table – receives columns + data + state */}
      <StatisticsTable<Invoice>
        columns={invoiceColumns}
        data={mockInvoices}
        getRowId={(row) => row.invoiceId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={mockInvoices.length}
        onViewDetail={(row) => {
          setSelectedInvoice(row);
          setSheetOpen(true);
        }}
      />

      <DetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        data={selectedInvoice}
        title="Invoice ID"
        primary={(d) => d.invoiceId}
        status={(d) => d.status}
        fields={[
          { label: "Invoice ID", value: (d) => d.invoiceId },
          { label: "Buyer", value: (d) => d.buyer },
          { label: "Amount", value: (d) => d.amount },
          { label: "Submitted", value: (d) => d.submittedOn },
        ]}
      />
    </div>
  );
};

export default AllInvoicePage;
