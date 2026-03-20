"use client";

import { Button, cn, Textarea } from "@cf/ui";
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconEye,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import StatusBadge from "@/components/common/status-badge";
import { STATUSES } from "@/utils/constants/status-constants";

interface Props {
  title: string;
  value: string | ReactNode;
  onViewClick?: () => void;
  onApproveClick?: () => void;
  onDeclineClick?: () => void;
  status?: string;
  onReasonChange?: (value: string) => void;
  onDeclineCancelClick?: () => void;
  onDeclineSaveClick?: () => void;
  onChangeClick?: () => void;
  reason?: string | null;
  isLoading?: boolean;
  noAction?: boolean;
  kycStatus?: string;
}

export default function ApprovalTileItem({
  title,
  value,
  onViewClick,
  onApproveClick,
  onDeclineClick,
  status = STATUSES.pending,
  onReasonChange,
  onDeclineCancelClick,
  onDeclineSaveClick,
  onChangeClick,
  reason,
  isLoading = false,
  noAction = false,
  kycStatus,
}: Props) {
  const [reasonValue, setReasonValue] = useState("");
  const t = useTranslations("common.approvalActions");

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReasonValue(e.target.value);
    onReasonChange?.(e.target.value);
  };

  return (
    <div className={"flex w-full flex-col gap-3 rounded-xl border px-4 py-3"}>
      <div className={"flex items-center justify-between gap-4"}>
        <div className={"flex flex-col gap-1"}>
          <p className={"text-secondary-foreground text-sm"}>{title}</p>
          {typeof value === "string" ? <p>{value}</p> : value}
        </div>
        {onViewClick && (
          <Button
            onClick={onViewClick}
            size={"sm"}
            variant={"secondary"}
            className={"h-8 font-bold text-[#1A5514]"}
          >
            <IconEye className={"size-4"} /> {t("view")}
          </Button>
        )}
      </div>
      {!noAction && (
        <>
          <hr className={"-mx-4"} />
          {status === STATUSES.pending && (
            <div
              className={"flex flex-col items-center gap-2 py-2 sm:flex-row"}
            >
              <Button
                disabled={isLoading}
                onClick={onApproveClick}
                size={"sm"}
                variant={"secondary"}
                className={"text-primary w-full font-bold sm:w-auto"}
              >
                <IconCircleCheck className={"size-4"} />
                {t("approve")}
              </Button>
              <Button
                disabled={isLoading}
                onClick={onDeclineClick}
                size={"sm"}
                variant={"secondary"}
                className={"w-full font-bold text-[#BA1A1A] sm:w-auto"}
              >
                <IconCircleX className={"size-4"} />
                {t("declineWithReason")}
              </Button>
            </div>
          )}

          {status === STATUSES.required && (
            <div className={"flex flex-col gap-2 py-2"}>
              <div className={"flex flex-col gap-2 sm:flex-row"}>
                <div className={"w-full"}>
                  <Button
                    disabled={isLoading}
                    onClick={onDeclineClick}
                    size={"sm"}
                    variant={"secondary"}
                    className={"w-full font-bold text-[#BA1A1A] sm:w-auto"}
                  >
                    <IconCircleX className={"size-4"} />
                    {t("declineWithReason")}
                  </Button>
                </div>

                <div className={"flex w-full justify-end gap-2"}>
                  <Button
                    disabled={isLoading}
                    onClick={onDeclineCancelClick}
                    size={"sm"}
                    variant={"outline"}
                    className={
                      "hover:bg-btn-hover sm:auto hover:text-foreground w-full font-bold sm:w-auto"
                    }
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    onClick={onDeclineSaveClick}
                    size={"sm"}
                    variant={"outline"}
                    className={
                      "hover:bg-btn-hover sm:auto hover:text-foreground w-full font-bold sm:w-auto"
                    }
                    disabled={!reasonValue || isLoading}
                  >
                    {t("save")}
                  </Button>
                </div>
              </div>
              <Textarea
                id={"reason"}
                name={"reason"}
                rows={3}
                value={reasonValue}
                onChange={handleOnChange}
                placeholder={t("reasonPlaceholder")}
                className={cn(
                  "placeholder:text-placeholder-text bg-primary-light text-foreground resize-none rounded-xl border-none text-sm focus-visible:ring-1",
                )}
              />
            </div>
          )}
          {status === STATUSES.accepted && (
            <div
              className={"flex flex-col items-center gap-2 py-2 sm:flex-row"}
            >
              <StatusBadge
                status={status}
                isBold={true}
                iconClassName={"size-4"}
                className={
                  "h-9 w-full justify-center rounded-md text-sm font-medium sm:w-fit sm:justify-start"
                }
              />
              <Button
                onClick={onChangeClick}
                size={"sm"}
                variant={"outline"}
                className={
                  "hover:bg-btn-hover sm:auto hover:text-foreground w-full sm:w-auto"
                }
              >
                <IconEdit className={"size-4"} />
                {t("change")}
              </Button>
            </div>
          )}
          {status === STATUSES.declined && (
            <div className={"flex flex-col gap-2 py-2"}>
              <div className={"flex flex-col items-center gap-2 sm:flex-row"}>
                <StatusBadge
                  status={status}
                  statusText={t("declinedWithReason")}
                  isBold={true}
                  iconClassName={"size-4"}
                  className={
                    "h-9 w-full justify-center rounded-md text-sm font-medium normal-case sm:w-fit sm:justify-start"
                  }
                />
                <Button
                  onClick={onChangeClick}
                  size={"sm"}
                  variant={"outline"}
                  className={
                    "hover:bg-btn-hover hover:text-foreground w-full sm:w-auto"
                  }
                >
                  <IconEdit className={"size-4"} />
                  {t("change")}
                </Button>
              </div>
              <Textarea
                id={"declinedReason"}
                rows={3}
                className={cn(
                  "placeholder:text-placeholder-text bg-primary-light text-foreground resize-none rounded-xl border-none text-sm focus-visible:ring-1",
                )}
                readOnly
                value={reason ?? ""}
              />
            </div>
          )}
        </>
      )}

      {kycStatus !== "Submitted" && (
        <>
          {status === STATUSES.accepted && (
            <StatusBadge
              status={status}
              isBold={true}
              iconClassName={"size-4"}
              className={
                "h-8 w-full justify-center rounded-md text-sm font-medium sm:w-fit sm:justify-start"
              }
            />
          )}
          {status === STATUSES.declined && (
            <div
              className={
                "flex flex-col items-center gap-2 sm:flex-row sm:gap-4"
              }
            >
              <StatusBadge
                status={status}
                isBold={true}
                iconClassName={"size-4"}
                className={
                  "h-8 w-full justify-center rounded-md text-sm font-medium sm:w-fit sm:justify-start"
                }
              />
              <p className={"text-xs"}>{reason}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
