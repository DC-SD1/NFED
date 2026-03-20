import FulfilmentChart from "@/components/dashboard/fulfilment/fulfiilment-chart";
import FulfilmentCard from "@/components/dashboard/fulfilment/fulfilment-card";
import AppTitleToolBar from "@/components/layout/app-title-tool-bar";
import {
    IconArrowDown,
    IconArrowDownLeft,
    IconArrowUpRight,
    IconCash,
    IconChevronDown,
    IconDownload,
    IconListDetails,
    IconLoader,
    IconLockSquareRounded,
    IconReceipt,
    IconWallet,
} from "@tabler/icons-react";
import React from "react";

const statsData = [
    {
        title: "Total balance",
        value: "GHS 100,000",
        info: 'Last updated: 11:34 AM',
        icon: IconWallet,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
    },
    {
        title: "Pending disbursements",
        value: "GHS 200,000",
        info: "10 pending disbursements",
        icon: IconLockSquareRounded,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    {
        title: "Total inflows",
        value: "GHS 200,000",
        info: "-20%",
        icon: IconArrowDownLeft,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
    },
    {
        title: "Total outflows",
        value: "GHS 200,000",
        info: "+20%",
        icon: IconArrowUpRight,
        bgColor: "bg-red-100",
        iconColor: "text-red-500",
    },
];

const FulfilmentCentersPage = () => {
    return (
        <div className="flex flex-col px-2 px-8 pb-8">
            <div className="flex items-center justify-between gap-1 border-b p-4">
                <div className="flex items-center gap-1">
                    <AppTitleToolBar title={"All refunds"} />
                    <IconChevronDown className="text-green-600" />
                </div>
                <button className="flex gap-1 rounded-lg bg-[#EDF0E6] px-2 py-1 text-sm font-bold text-[#1A5514] hover:bg-green-500 hover:text-white">
                    <IconDownload size={16} />
                    Export
                </button>
            </div>

            <FulfilmentCard statsData={statsData} />

            <FulfilmentChart />
        </div>
    );
};

export default FulfilmentCentersPage;
