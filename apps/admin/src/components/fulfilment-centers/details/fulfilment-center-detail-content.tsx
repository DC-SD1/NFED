"use client";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cf/ui";
import {
  IconArchive,
  IconEdit,
  IconInfoCircle,
  IconLibraryPlus,
} from "@tabler/icons-react";
import { Download, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import FulfilmentCenterAssigneesTab from "@/components/fulfilment-centers/details/assigned-tab/fulfilment-center-assignees-tab";
import FulfilmentCenterDetailsTab from "@/components/fulfilment-centers/details/detail-tab/fulfilment-center-details-tab";
import FulfilmentCenterDetailRightContent from "@/components/fulfilment-centers/details/fulfilment-center-detail-right-content";
import AppDetailLayout from "@/components/layout/details/app-detail-layout";
import CustomerDetailLoader from "@/components/skeleton/customer-detail-loader";
import { useApiClient } from "@/lib/api";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import { useModal } from "@/lib/stores/use-modal";

export interface ActionItem {
  icon?: React.ReactNode;
  className?: string;
  actionName: string;
  action: () => void;
}

// Import missing icons if any

import { SAMPLE_FULFILMENT_CENTERS } from "@/utils/constants/sample-data";

// ... other imports

export default function FulfilmentCenterDetailContent() {
  const t = useTranslations("fulfillmentCenters.details");
  const { id: centerId } = useParams<{ id: string }>();
  const api = useApiClient();
  const { onOpen } = useModal();
  const reset = useFulfilmentCenterStore.use.reset();
  const customFulfilmentCenters =
    useFulfilmentCenterStore.use.customFulfilmentCenters();

  // Find center from custom store or sample data
  const center = React.useMemo(() => {
    const allCenters = [
      ...(customFulfilmentCenters as unknown as any[]),
      ...SAMPLE_FULFILMENT_CENTERS,
    ];
    return allCenters.find((c) => c.id === centerId);
  }, [centerId, customFulfilmentCenters]);

  const { data: _response } = api.useQuery(
    "get",
    "/fulfillment-centers/{FulfillmentCenterId}",
    {
      params: {
        path: {
          FulfillmentCenterId: centerId,
        },
      },
    },
    {
      enabled: false, // Disable API fetching
    },
  );

  const isLoadingCenter = false; // Since we are using local check

  const actions: ActionItem[] = [
    {
      icon: <IconEdit className={"size-4"} />,
      actionName: t("actions.edit"),
      action: () => {
        reset();
        onOpen("EditFulfilmentCenter", { center: center, isDetailRoute: true });
      },
    },
    {
      className: "text-error-color focus:text-error-color",
      icon: <IconArchive className={"size-4"} />,
      actionName: t("actions.archiveCenter"),
      action: () => {
        // empty
      },
    },
  ];

  if (isLoadingCenter) {
    return <CustomerDetailLoader />;
  }

  return (
    <AppDetailLayout>
      <AppDetailLayout.Header
        breadcrumbList={[
          {
            label: t("breadcrumbList.fulfillmentCenters"),
            href: `/fulfilment-centers`,
            isBackUrl: true,
          },
          {
            label: t("breadcrumbList.details"),
          },
        ]}
        title={center?.name ?? ""}
        status={"active"}
        toolBar={
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <Button
              size="sm"
              className="text-success-secondary h-10 w-full bg-secondary text-sm font-bold hover:bg-secondary/90 sm:h-9 sm:w-auto"
            >
              <Download size={16} />
              {t("export")}
            </Button>

            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"sm"}
                    className="size-7 bg-secondary px-4 hover:bg-secondary/90 hover:text-foreground"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl py-1.5"
                >
                  {actions.map((item, index) => (
                    <DropdownMenuItem
                      className={cn(
                        "focus:bg-btn-hover flex items-center gap-4 text-foreground focus:text-foreground",
                        item.className,
                      )}
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                      }}
                    >
                      {item.icon}
                      {item.actionName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <AppDetailLayout.Main
        tabs={[
          {
            value: "details",
            label: t("tabs.details"),
            icon: IconInfoCircle,
            content: <FulfilmentCenterDetailsTab center={center} />,
          },
          {
            value: "assignees",
            label: t("tabs.assigned"),
            icon: IconLibraryPlus,
            content: <FulfilmentCenterAssigneesTab />,
          },
          {
            value: "wallet",
            label: t("tabs.wallet"),
            icon: IconLibraryPlus,
            content: <FulfilmentCenterAssigneesTab />,
          },
        ]}
        defaultValue="details"
      />

      <AppDetailLayout.Side>
        <FulfilmentCenterDetailRightContent center={center} />
      </AppDetailLayout.Side>
    </AppDetailLayout>
  );
}
