import { Button } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PenSquareIcon, UserRoundMinusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast } from "@/lib/utils/toast";
import type {
  DraftManagerTableRow,
  FarmManagerTableRow,
} from "@/types/farm-manager-item";

const ActionCell = ({ row }: { row: FarmManagerTableRow }) => {
  const router = useRouter();
  const { onOpen } = useModal();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const tErrors = useTranslations("auth.errors");
  const { userId: authUserId } = useAuthUser();
  const isDraft = row.contract?.contractStatus === "Draft";

  const deactivateContractMutation = api.useMutation(
    "post",
    "/farm-management/contracts/deactivate",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/users/farm-managers/{FarmOwnerId}",
            { params: { path: { FarmOwnerId: authUserId } } },
          ],
        });

        onOpen("Success", {
          successTitle: "Farm manager deactivated!",
          successDescription:
            "Farm manager deactivated successfully. You can re-active the farm by assigning them to a farm.",
        });
      },
      onError: () => {
        showErrorToast(tErrors("failedToDeactivateManager"));
      },
    },
  );

  const handleDeleteClick = () => {
    if (row.contract?.contractStatus === "Terminated") {
      showErrorToast(tErrors("farmManagerDeactivated"));
      return;
    }
    const farmManagerName =
      `${row.farmManager?.firstName || ""} ${row.farmManager?.lastName || ""}`.trim();

    onOpen("Error", {
      errorTitle: "Deactivate farm manager",
      errorSubtitle: (
        <>
          You are about to deactivate farm manager{" "}
          <strong>{farmManagerName}</strong>.
        </>
      ),
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
          // Close the modal
        },
        variant: "link",
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isDraft ? (
        <>
          <Button
            size="icon"
            variant="unstyled"
            aria-label="View Draft"
            onClick={() =>
              router.push(
                `/en/farm-owner/farm-managers/draft?id=${row.farmManager?.id}`,
              )
            }
          >
            <PenSquareIcon className="text-[#FBB33A]" />
          </Button>
          {/* <Button
            size="icon"
            className="text-primary"
            variant="unstyled"
            aria-label="Send Draft"
            
          >
            <SendIcon className="size-4" />
          </Button> */}
        </>
      ) : (
        <>
          {/* <Button size="icon" variant="unstyled" aria-label="View" disabled>
            <Eye className="size-4" />
          </Button> */}
          <Button
            size="icon"
            variant="unstyled"
            className="text-[#FBB33A]"
            aria-label="Edit"
            onClick={() =>
              router.push(
                `/farm-owner/farm-managers/details?id=${row.farmManager?.id}`,
              )
            }
          >
            <PenSquareIcon className="size-4" />
          </Button>
          <Button
            size="icon"
            className="text-[#BA1A1A]"
            variant="unstyled"
            aria-label="Delete"
            onClick={handleDeleteClick}
          >
            <UserRoundMinusIcon className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
};

const DraftActionCell = ({ row }: { row: DraftManagerTableRow }) => {
  const router = useRouter();
  const handleSendClick = () => {
    const id = row.farmManager.id;
    router.push(`/en/farm-owner/farm-managers/draft?id=${id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        className=""
        variant="unstyled"
        aria-label="View"
        onClick={handleSendClick}
      >
        <PenSquareIcon className="size-4 text-[#FBB33A]" />
      </Button>
      {/* <Button
        size="icon"
        className="text-primary"
        variant="unstyled"
        aria-label="Send"
        onClick={handleSendClick}
      >
        <SendIcon className="size-4" />
      </Button> */}
    </div>
  );
};

export const farmManagerColumns: ColumnDef<FarmManagerTableRow>[] = [
  {
    id: "item",
    header: "Item",
    cell: ({ row }) => row.original.uiItem,
  },
  {
    id: "name",
    accessorFn: (row) => row.farmManager?.firstName,
    header: "First name",
  },
  {
    id: "surname",
    accessorFn: (row) => row.farmManager?.lastName,
    header: "Last name",
  },
  {
    id: "contact",
    accessorFn: (row) => row.displayContact,
    header: "Contact",
  },
  {
    id: "assignedLand",
    accessorKey: "assignedLandDisplay",
    header: "Assigned land",
  },
  {
    id: "date",
    accessorKey: "displayDate",
    header: "Date",
  },
  {
    id: "badge",
    header: "Status",
    cell: ({ row }) => row.original.uiBadge,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionCell row={row.original} />,
  },
];

export const draftManagerColumns: ColumnDef<DraftManagerTableRow>[] = [
  {
    id: "name",
    accessorFn: (row) => row.farmManager.firstName,
    header: "First name",
  },
  {
    id: "surname",
    accessorFn: (row) => row.farmManager.lastName,
    header: "Last name",
  },
  {
    id: "contact",
    accessorKey: "displayContact",
    header: "Contact",
  },
  {
    id: "yearsOfExperience",
    accessorFn: (row) => row.farmManager.experienceYears,
    header: "Years of experience",
  },
  {
    id: "workType",
    accessorFn: (row) => row.displayWorkType,
    header: "Work type",
  },
  {
    id: "payType",
    accessorFn: (row) => row.displayPayType,
    header: "Pay type",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <DraftActionCell row={row.original} />,
  },
];
