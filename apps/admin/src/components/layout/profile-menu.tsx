"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  CaretDownFilled,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Logout,
} from "@cf/ui";
import { useClerk, useSession } from "@clerk/nextjs";
import { IconHistoryToggle, IconUserSquare } from "@tabler/icons-react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

import type { ValidRole } from "@/lib/schemas/auth";
import { ROLES } from "@/lib/schemas/auth";
import { useAuthActions, useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { getUserInitials, humanizeLabel } from "@/utils/helpers/common-helpers";

interface Props {
  isOpen: boolean;
  locale: string;

  onOpenChange?(open: boolean): void;
}

export default function ProfileMenu({ isOpen, onOpenChange: handleOpenChange, locale }: Props) {
  const { session } = useSession();
  const { signOut } = useClerk();
  const authActions = useAuthActions();
  const authUser = useAuthUser();
  const router = useRouter();
  const t = useTranslations("common.profileMenu");
  const { onOpen: isOpenModal } = useModal();

  // Get user role
  const userRoles = authUser.roles || [];
  const primaryRole = (userRoles[0] as ValidRole) || ROLES.ADMIN;

  const fullName =
    authUser?.fullName ||
    `${session?.user?.firstName} ${session?.user?.lastName}`;

  const handleLogout = async () => {
    try {
      // Call the logout action from auth store
      await authActions.logout(() => signOut(), router, locale);
    } catch (error) {
      // Fallback to direct navigation if logout fails
      router.replace(`/${locale}/`);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 rounded-full p-1">
          <Avatar className="size-9">
            <AvatarImage src={session?.user?.imageUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-primary-darkest text-primary-lightest text-sm">
              {getUserInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <CaretDownFilled className="text-foreground size-4 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-container w-72 rounded-2xl border-0 p-4 shadow-[0_0_20px_rgba(0,0,0,0.15)] md:w-96"
      >
        <DropdownMenuLabel className="p-0" asChild>
          <div className="flex items-center gap-4">
            <Avatar width={"w-16"} height={"h-16"}>
              <AvatarImage
                src={session?.user?.imageUrl || "/placeholder.svg"}
              />
              <AvatarFallback className="bg-primary-darkest text-primary-lightest text-sm">
                {getUserInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium leading-none">{fullName}</p>
              <p className="text-secondary-foreground text-sm leading-none">
                {humanizeLabel(primaryRole)}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={"bg-border my-3"} />

        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-foreground flex items-center justify-between rounded-xl bg-white py-3 text-base"
          onSelect={() => isOpenModal("UserProfile")}
        >
          <div className="flex items-center gap-4">
            <IconUserSquare className="size-6" />
            {t("profile")}
          </div>
          <ChevronRight className="size-6" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-foreground flex items-center justify-between rounded-xl bg-white py-3 text-base"
          onSelect={() => {
            isOpenModal("ActivityHistory");
          }}
        >
          <div className="flex items-center gap-4">
            <IconHistoryToggle className="size-6" />
            {t("activityLog")}
          </div>
          <ChevronRight className="size-6" />
        </DropdownMenuItem>

        <DropdownMenuSeparator className={"bg-border"} />

        <DropdownMenuItem
          className="focus:bg-btn-hover flex items-center gap-4 rounded-xl bg-white py-3 text-base text-[#BA1A1A] hover:bg-red-50 focus:text-[#BA1A1A]"
          onSelect={handleLogout}
        >
          <Logout className="size-6" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
