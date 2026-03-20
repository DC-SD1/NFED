"use client";

import { Button, cn } from "@cf/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useProfileCompletion } from "@/lib/hooks/use-profile-completion";

import { MissingItemsCard } from "./missing-items-card";

const BASE_HEIGHT = 531;
const COLLAPSED_HEIGHT = 250;
const ONE_CHILD_ITEM_HEIGHT = 360;
const BOTH_CHILDREN_HEIGHT = 340;

export function ProfileCompletionCard() {
  const t = useTranslations("settings.profile.completionCard");
  const { percentage: completionPercentage, isLoading } = useProfileCompletion();
  const [isMissingCollapsed, setIsMissingCollapsed] = useState(false);
  const [openSectionsCount, setOpenSectionsCount] = useState(2);
  const cardHeight = (() => {
    if (isMissingCollapsed) return COLLAPSED_HEIGHT;
    if (openSectionsCount === 0) return BOTH_CHILDREN_HEIGHT;
    if (openSectionsCount === 1) return ONE_CHILD_ITEM_HEIGHT;
    return BASE_HEIGHT;
  })();

  const filledBars = Math.round((completionPercentage / 100) * 5);

  return (
    <div
      className={cn(
        "w-full space-y-6 rounded-2xl border-[hsl(var(--border-light))] bg-[hsl(var(--background-light))] p-4 transition-[height] duration-300 md:p-6 lg:border lg:bg-transparent lg:p-4",
      )}
      style={{ height: cardHeight }}
    >
      <div className="space-y-2">
        <p className="font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            t("title", { percentage: completionPercentage })
          )}
        </p>
        <div className="flex w-full items-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn("h-[8px] w-1/5 rounded-full bg-[#DDE4E4]", {
                "bg-primary": index < filledBars,
              })}
            />
          ))}
        </div>
      </div>

      <MissingItemsCard
        isCollapsed={isMissingCollapsed}
        onCollapsedChangeAction={setIsMissingCollapsed}
        onOpenSectionsChangeAction={setOpenSectionsCount}
      />

      <div className="flex items-center gap-2">
        <Button variant="secondary" className="w-full rounded-2xl">
          {t("doLater")}
        </Button>
        <Button className="w-full rounded-2xl">{t("completeNow")}</Button>
      </div>
    </div>
  );
}
