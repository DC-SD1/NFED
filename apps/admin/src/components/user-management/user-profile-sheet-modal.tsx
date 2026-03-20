"use client";

import { Avatar, AvatarFallback, AvatarImage, cn, Skeleton } from "@cf/ui";
import { React } from "@cf/ui/icons";
import { useSession } from "@clerk/nextjs";
import { IconEdit, IconHistoryToggle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import AppSheetModal from "@/components/sheets/app-sheet-modal";
import { useApiClient } from "@/lib/api";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import type { UserDetailResponse } from "@/types/user-management.types";
import { STATUS_COLORS } from "@/utils/constants/status-constants";
import { getUserInitials } from "@/utils/helpers/common-helpers";

export default function UserProfileSheetModal() {
  const { isOpen, onClose, type, onOpen } = useModal();
  const t = useTranslations("userManagement");
  const isModalOpen = isOpen && type === "UserProfile";
  const api = useApiClient();
  const { session } = useSession();
  const authUser = useAuthUser();

  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";

  const fullName =
    authUser?.fullName ||
    `${session?.user?.firstName} ${session?.user?.lastName}`;

  const { data: response, isLoading } = api.useQuery(
    "get",
    "/admin/users/{UserId}",
    {
      params: {
        path: { UserId: authUser?.userId },
      },
      enabled: !!authUser?.userId && isModalOpen,
    },
  ) as { data: UserDetailResponse; isLoading: boolean };

  const user = response?.data;

  return (
    <AppSheetModal
      key={"user-profile-sheet"}
      title={t("accountDetail.title")}
      open={isModalOpen}
      onClose={onClose}
    >
      <div className="flex flex-col gap-16">
        <div className="flex items-center gap-4">
          <Avatar
            width={"w-16"}
            height={"h-16"}
            className={"text-xl font-bold text-white"}
          >
            <AvatarImage src={session?.user?.imageUrl || "/placeholder.svg"} />
            <AvatarFallback
              width={"w-16"}
              height={"h-16"}
              className="bg-primary-darkest text-primary-lightest text-sm"
            >
              {getUserInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p>{fullName}</p>
            <p className="text-secondary-foreground text-sm">{userEmail}</p>
            <p className={cn("text-sm", STATUS_COLORS.active)}>Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isLoading) return;
              onClose();
              onOpen("EditAccount", { user });
            }}
            className={
              "text-foreground hover:bg-btn-hover flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]"
            }
          >
            <IconEdit className={"size-5 text-[#44C63A]"} />
            {t("accountDetail.editAccount")}
          </button>
          <button
            onClick={() => {
              onClose();
              onOpen("ActivityHistory");
            }}
            className={
              "text-foreground hover:bg-btn-hover flex flex-1 flex-col items-center gap-2 rounded-lg border bg-white p-3 text-sm shadow-[0px_1px_6px_0px_rgba(22,29,20,0.16)]"
            }
          >
            <IconHistoryToggle className={"size-5 text-[#44C63A]"} />
            {t("accountDetail.activityHistory")}
          </button>
        </div>

        <div className={"rounded-xl border p-4"}>
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.department")}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-4 w-48" />
            ) : (
              <p>{user?.department ?? ""}</p>
            )}
          </div>
          <hr className={"bg-border my-4"} />
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.assignedRole")}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-4 w-48" />
            ) : (
              <p>{user?.role ?? ""}</p>
            )}
          </div>
          <hr className={"bg-border my-4"} />
          <div>
            <p className={"text-secondary-foreground text-sm font-bold"}>
              {t("accountDetail.phoneNumber")}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-4 w-48" />
            ) : (
              <p>
                {!user?.phoneNumber || user?.phoneNumber === "0"
                  ? "Not provided"
                  : user?.phoneNumber}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppSheetModal>
  );
}
