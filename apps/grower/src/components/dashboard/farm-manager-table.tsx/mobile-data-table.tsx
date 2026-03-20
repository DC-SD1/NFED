import { Button } from "@cf/ui";
import {
  ChevronDownCircleIcon,
  PenSquareIcon,
  UserRoundMinusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";
import type { FarmManagerTableRow } from "@/types/farm-manager-item";

interface Props {
  data: (FarmManagerTableRow & { status: string })[];
}

export function MobileManagerTable({ data }: Props) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(5);
  const router = useRouter();
  const { onOpen } = useModal();
  const api = useApiClient();
  const tErrors = useTranslations("auth.errors");

  const toggleExpand = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };
  const deactivateContractMutation = api.useMutation(
    "post",
    "/farm-management/contracts/deactivate",
    {
      onSuccess: async () => {
        router.push("/farm-owner/farm-managers/delete-success");
      },
      onError: () => {
        showErrorToast(tErrors("failedToDeactivateManager"));
      },
    },
  );

  const handleDeleteClick = (row: FarmManagerTableRow) => {
    if (row.contract?.contractStatus === "Terminated") {
      showErrorToast(tErrors("farmManagerDeactivated"));
      return;
    }
    const farmManagerName =
      `${row.farmManager?.firstName || ""} ${row.farmManager?.lastName || ""}`.trim();

    onOpen("Error", {
      errorTitle: "Deactivate farm manager",
      errorSubtitle: `${farmManagerName}.`,
      errorDescription: "Are you sure you want to continue?",
      primaryButton: {
        label: "Continue and deactivate ›",
        onClick: () => {
          if (!row.contract?.id) return;
          deactivateContractMutation.mutate({
            body: {
              contractId: row.contract.id,
            },
          });
        },
        variant: "default",
      },
      secondaryButton: {
        label: "Cancel",
        onClick: () => {
          //
        },
        variant: "link",
      },
    });
  };

  const handleViewMore = () => {
    setVisibleItems((prev) => prev + 5);
  };

  const displayedData = data.slice(0, visibleItems);
  const hasMoreItems = visibleItems < data.length;

  return (
    <div className="mb-10 w-full space-y-2 overflow-hidden">
      {displayedData.map((row) => {
        const isDraft = row.status === "Draft";
        const isExpanded = expandedRowId === row.farmManager?.id;

        return (
          <div
            key={row.farmManager?.id}
            className="overflow-hidden rounded-xl border p-3 px-2 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black">
                  {row.uiItem}
                </span>
                <span className="text-muted-foreground max-w-[150px] flex-wrap break-words text-start text-sm">
                  {row.farmManager?.firstName} {row.farmManager?.lastName}
                </span>
              </div>
              <div className="flex items-center">
                {!isExpanded && (
                  <span className="text-muted-foreground truncate text-sm">
                    {row.uiBadge}
                  </span>
                )}
                <Button
                  size="icon"
                  variant="unstyled"
                  onClick={() => toggleExpand(row.farmManager?.id ?? "")}
                  aria-label="Expand row"
                >
                  <ChevronDownCircleIcon
                    className={`text-primary size-8 transition-transform ${
                      isExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Name</span>
                    <span className="text-muted-foreground truncate">
                      {row.farmManager?.firstName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Surname</span>
                    <span className="text-muted-foreground truncate">
                      {row.farmManager?.lastName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Email</span>
                    <span className="text-muted-foreground break-words">
                      {row.farmManager?.emailAddress}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Assigned land</span>
                    <span className="text-muted-foreground truncate">
                      {row.contract?.comments}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Date</span>
                    <span className="text-muted-foreground truncate">
                      {row.displayDate}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-semibold">Status</span>
                    <span className="text-muted-foreground truncate">
                      {row.uiBadge}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold">Actions</span>
                  <div className="mt-2 flex gap-2">
                    {isDraft ? (
                      <>
                        <Button
                          size="icon"
                          className="rounded-full"
                          variant="ghost"
                          aria-label="View Draft"
                          onClick={() =>
                            router.push(
                              `/en/farm-owner/farm-managers/draft?id=${row.farmManager?.id}`,
                            )
                          }
                        >
                          <PenSquareIcon className="size-4 text-[#FBB33A]" />
                        </Button>
                        {/* <Button
                          size="icon"
                          className="text-primary rounded-full"
                          variant="ghost"
                          aria-label="Send Draft"
                        >
                          <SendIcon className="size-4" />
                        </Button> */}
                      </>
                    ) : (
                      <>
                        {/* <Button
                          size="icon"
                          className="rounded-full bg-[#D8DBD2]"
                          variant="unstyled"
                          aria-label="View"
                          disabled
                        >
                          <Eye className="size-4" />
                        </Button> */}
                        <Button
                          size="icon"
                          variant="unstyled"
                          className="bg-yellow-light text-yellow-dark rounded-full"
                          aria-label="Edit"
                          onClick={() => {
                            router.push(
                              `/farm-owner/farm-managers/details?id=${row.farmManager?.id}`,
                            );
                          }}
                        >
                          <PenSquareIcon className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="bg-red-light text-red-dark rounded-full"
                          variant="unstyled"
                          aria-label="Delete"
                          onClick={() => handleDeleteClick(row)}
                        >
                          <UserRoundMinusIcon className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {hasMoreItems && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleViewMore}
            variant="unstyled"
            className="text-primary rounded-full px-6 py-2"
          >
            Load more...
          </Button>
        </div>
      )}
    </div>
  );
}
