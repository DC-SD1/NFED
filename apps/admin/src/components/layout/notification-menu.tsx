"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cf/ui";
import { IconBell, IconBellRinging } from "@tabler/icons-react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

interface Props {
  isOpen: boolean;

  onOpenChange?(open: boolean): void;
}

export default function NotificationMenu({ isOpen, onOpenChange }: Props) {
  const t = useTranslations("common.notificationMenu");

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-primary-light relative rounded-full"
        >
          <Bell className="size-5" />
          {/* TODO: Add notification count when API is ready */}
          {/* <span className="bg-destructive text-destructive-foreground absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
            2
          </span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-container w-96 rounded-2xl border-0 px-0 py-4 shadow-[0_0_20px_rgba(0,0,0,0.15)] md:w-[480px]"
      >
        <DropdownMenuLabel className="p-0 px-6" asChild>
          <div className="flex items-center justify-between gap-4">
            <div className={"flex items-center gap-4"}>
              <IconBell className={"size-6"} />
              <p className={"text-xl font-bold"}>{t("title")}</p>
            </div>
            <Button
              size={"sm"}
              variant={"secondary"}
              className={"font-bold text-[#1A5514]"}
            >
              {t("markAllAsRead")}
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={"bg-border -mx-6 my-3"} />

        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-[#F4FCEC] px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-primary size-6"} />
          <div>
            <p className={"text-primary"}>Grower KYC submission</p>
            <p className={"text-secondary-foreground text-sm"}>
              Grower [Grower Name] submitted KYC information for review
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-btn-hover focus:text-secondary-foreground flex items-center gap-4 bg-white px-6 py-3 text-base"
          // onSelect={() => isOpenModal("UserProfile")}
        >
          <IconBellRinging className={"text-foreground size-6"} />
          <div>
            <p className={"text-foreground"}>Suspend Bright Asamoah (Grower)</p>
            <p className={"text-secondary-foreground text-sm"}>
              Agent [Agent Name] requested Grower [Grower Name]&#39;s account be
              suspended.
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
