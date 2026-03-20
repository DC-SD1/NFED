"use client";

import StatisticsCard from "@/components/dashboard/statistics/statistics-card";
import { DetailSheet } from "@/components/dashboard/statistics/statistics-details";
import StatisticsFilter from "@/components/dashboard/statistics/statistics-filter";
import StatisticsTable from "@/components/dashboard/statistics/statistics-table";
import StatusBadge from "@/components/dashboard/statistics/status-badge";
import { Column, Refund } from "@/components/dashboard/statistics/types/tables";
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
import {
    IconCircleArrowUpRight,
    IconClock,
    IconDownload,
    IconHourglass,
    IconReload,
    IconStack,
} from "@tabler/icons-react";
import React, { useMemo, useState } from "react";

const statsData = [
    {
        title: "Total refund distributed",
        value: "GHS 133,000",
        badge: null,
        icon: IconCircleArrowUpRight,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        title: "Refunds in queue",
        value: "12",
        badge: null,
        icon: IconHourglass,
        bgColor: "bg-[#FEF0D8]",
        iconColor: "text-[#995917]",
    },
    {
        title: "Total refunds in queue",
        value: "GHS 48,000",
        badge: null,
        icon: IconStack,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        title: "Avg resolution time",
        value: "3.4 days",
        badge: null,
        info: "12 requests",
        icon: IconClock,
        bgColor: "bg-[#FEF0D8]",
        iconColor: "text-[#995917]",
    },
];


const refundColumns: Column<Refund>[] = [
    {
        id: "transactionId",
        label: "Transaction ID",
        render: (row) => row.transactionId,
    },
    {
        id: "userType",
        label: "User Type",
        render: (row) => row.userType,
    },
    {
        id: "name",
        label: "Name",
        render: (row) => row.name,
    },
    {
        id: "invoiceId",
        label: "Invoice ID",
        render: (row) => row.invoiceId,
    },
    {
        id: "amount",
        label: "Amount",
        align: "right",
        render: (row) => row.amount,
    },
    {
        id: "reason",
        label: "Reason",
        render: (row) => row.reason,
    },
    {
        id: "requestedOn",
        label: "Requested On",
        render: (row) => row.requestedOn,
    },
    {
        id: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
    },
];

const mockRefunds: Refund[] = [
    {
        transactionId: "TRA-221",
        userType: "Grower",
        name: "GreenMart DE",
        invoiceId: "INV-4432",
        amount: "GHS4,500",
        reason: "Overpayment",
        requestedOn: "Jul 10, 2025",
        status: "Success",
    },
    {
        transactionId: "TRA-221",
        userType: "Agent",
        name: "GreenMart DE",
        invoiceId: "INV-4438",
        amount: "GHS2,100",
        reason: "Overdue",
        requestedOn: "Jul 25, 2025",
        status: "Success",
    },
    {
        transactionId: "TRA-221",
        userType: "Buyer",
        name: "GreenMart DE",
        invoiceId: "INV-4439",
        amount: "GHS1,600",
        reason: "Successful",
        requestedOn: "Jul 30, 2025",
        status: "Failed",
    },
    {
        transactionId: "TRA-221",
        userType: "Grower",
        name: "GreenMart DE",
        invoiceId: "INV-4437",
        amount: "GHS900",
        reason: "Completed",
        requestedOn: "Jul 22, 2025",
        status: "Success",
    },
    {
        transactionId: "TRA-221",
        userType: "Agent",
        name: "GreenMart DE",
        invoiceId: "INV-4436",
        amount: "GHS4,800",
        reason: "Chargeback",
        requestedOn: "Jul 20, 2025",
        status: "Failed",
    },
    {
        transactionId: "TRA-221",
        userType: "Buyer",
        name: "GreenMart DE",
        invoiceId: "INV-4433",
        amount: "GHS3,200",
        reason: "Payment Received",
        requestedOn: "Jul 12, 2025",
        status: "Success",
    },
    {
        transactionId: "TRA-221",
        userType: "Grower",
        name: "GreenMart DE",
        invoiceId: "INV-4435",
        amount: "GHS2,500",
        reason: "Pending",
        requestedOn: "Jul 18, 2025",
        status: "Success",
    },
    {
        transactionId: "TRA-221",
        userType: "Grower",
        name: "GreenMart DE",
        invoiceId: "INV-4434",
        amount: "GHS1,750",
        reason: "Refund Issued",
        requestedOn: "Jul 15, 2025",
        status: "Success",
    },
]

const AllRefundsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [amountRange, setAmountRange] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false)

    const itemsPerPage = 10;

    const filteredData = useMemo(() => {
        return mockRefunds.filter((item) => {
            const searchMatch =
                item.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase());

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
                            <BreadcrumbPage>All refunds</BreadcrumbPage>
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


            <StatisticsTable<Refund>
                columns={refundColumns}
                data={mockRefunds}
                getRowId={(row) => row.transactionId}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={mockRefunds.length}
                onViewDetail={(row) => {
                    setSelectedRefund(row);
                    setSheetOpen(true);
                }}
            />

            <DetailSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                data={selectedRefund}
                title="Refund ID"
                primary={(d) => d.transactionId}
                status={(d) => d.status}
                fields={[
                    { label: "Transaction ID", value: (d) => d.transactionId },
                    { label: "Name", value: (d) => d.name },
                    { label: "Amount", value: (d) => d.amount },
                    { label: "Reason", value: (d) => d.reason },
                ]}
            />
        </div >
    );
};

export default AllRefundsPage;
