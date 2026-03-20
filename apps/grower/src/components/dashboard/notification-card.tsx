"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn,
  Skeleton,
} from "@cf/ui";
import { BellIcon } from "@cf/ui/icons";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  formatNotificationCount,
  getNotificationLabel,
} from "@/lib/notifications/display-utils";
import {
  type NotificationItem,
  useNotifications,
} from "@/lib/notifications/notifications-store";
import { type NotificationCategory } from "@/lib/notifications/workflow-config";

type NotificationFilterOption = "All" | "Unread" | NotificationCategory;

export default function NotificationsCard() {
  const t = useTranslations("dashboard.notifications");
  const locale = useLocale();
  const { notifications, isLoading, totalCount } = useNotifications();
  const [activeFilter, setActiveFilter] = useQueryState(
    "notificationFilter",
    parseAsStringEnum([
      "All",
      "Unread",
      "Reminder",
      "Task",
      "Alert",
    ]).withDefault("All"),
  );
  const [, setIsDrawerOpen] = useQueryState(
    "notificationsDrawer",
    parseAsBoolean.withDefault(false),
  );

  const tabs = useMemo<NotificationFilterOption[]>(
    () => ["All", "Unread", "Reminder", "Task", "Alert"],
    [],
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") return notifications;
    if (activeFilter === "Unread")
      return notifications.filter((notification) => !notification.isRead);
    const normalizedFilter = activeFilter.toLowerCase();
    return notifications.filter((notification) => {
      if (
        notification.category &&
        notification.category.toLowerCase() === normalizedFilter
      ) {
        return true;
      }
      return notification.tags.some((tag) => tag === normalizedFilter);
    });
  }, [activeFilter, notifications]);

  const tabRefs = useRef<
    Record<NotificationFilterOption, HTMLButtonElement | null>
  >({
    All: null,
    Unread: null,
    Reminder: null,
    Task: null,
    Alert: null,
  });
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateUnderline = () => {
      const el = tabRefs.current[activeFilter];
      if (el) {
        setUnderlineStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    requestAnimationFrame(updateUnderline);
  }, [activeFilter, tabs, filteredNotifications.length]);

  useEffect(() => {
    const handleResize = () => {
      const el = tabRefs.current[activeFilter];
      if (el) {
        setUnderlineStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeFilter]);

  const formatTimestamp = useCallback(
    (isoString: string) => {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    },
    [locale],
  );

  const getDisplayLabel = useCallback(
    (notification: NotificationItem) => {
      return getNotificationLabel(notification, (key: string) => t(key as any));
    },
    [t],
  );

  const totalNotifications = formatNotificationCount(totalCount);

  // Determine the date label based on the latest notification
  const dateLabel = useMemo(() => {
    if (filteredNotifications.length === 0) {
      return t("today"); // Default to "today" if no notifications
    }

    // Get the most recent notification
    const latestNotification = filteredNotifications[0];
    if (!latestNotification) {
      return t("today");
    }

    const notificationDate = new Date(latestNotification.createdAt);
    const now = new Date();

    // Check if it's today
    const isToday =
      notificationDate.getDate() === now.getDate() &&
      notificationDate.getMonth() === now.getMonth() &&
      notificationDate.getFullYear() === now.getFullYear();

    if (isToday) {
      return t("today");
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      notificationDate.getDate() === yesterday.getDate() &&
      notificationDate.getMonth() === yesterday.getMonth() &&
      notificationDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return t("yesterday");
    }

    // For older dates, format as "Month Day, Year" or "Month Day" if same year
    const options: Intl.DateTimeFormatOptions =
      notificationDate.getFullYear() === now.getFullYear()
        ? { month: "long", day: "numeric" }
        : { month: "long", day: "numeric", year: "numeric" };

    return new Intl.DateTimeFormat(locale, options).format(notificationDate);
  }, [filteredNotifications, locale, t]);

  return (
    <Card className="w-full rounded-3xl border-none shadow-[0_16px_40px_rgba(36,108,70,0.14)]">
      <CardHeader className="px-3 pb-3 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-normal">{t("title")}</h2>
            <Badge
              variant="destructive"
              className="rounded-full bg-red-light px-2 py-1 text-sm font-medium text-red-dark"
            >
              {totalNotifications}
            </Badge>
          </div>
          <MoreHorizontal className="size-6" />
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "space-y-2 overflow-y-auto px-3  pb-3",
          filteredNotifications.length === 0 ? "text-center" : "",
        )}
      >
        <div className="w-full overflow-x-auto">
          <div
            role="tablist"
            aria-label={t("title")}
            className="relative flex min-w-0 gap-1"
          >
            {tabs.map((tab) => (
              <Button
                ref={(el) => {
                  tabRefs.current[tab] = el;
                }}
                key={tab}
                type="button"
                variant="unstyled"
                role="tab"
                aria-selected={activeFilter === tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap pb-3 text-base font-medium transition-colors duration-200",
                  activeFilter === tab
                    ? "text-[hsl(var(--primary-dark))]"
                    : "text-muted-foreground hover:text-[hsl(var(--primary-dark))]",
                )}
              >
                {t(`tab${tab}`)}
              </Button>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-black/10" />
            <div
              className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
            />
          </div>
        </div>
        <div className="px-3 py-2">
          <p className="text-md m-0 text-muted-foreground">{dateLabel}</p>
        </div>
        {isLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="rounded-xl bg-card-light-background p-2"
              >
                <div className="mb-1 flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </>
        ) : filteredNotifications.length === 0 ? (
          <>
            <div className="mb-4 flex justify-center">
              <BellIcon />
            </div>
            <h3 className="mb-3 text-base font-semibold">
              {t("noNotificationsTitle")}
            </h3>
            <p className="mb-8 text-gray-dark">
              {t("noNotificationsSubtitle")}
            </p>
          </>
        ) : (
          <>
            {filteredNotifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl bg-card-light-background p-2"
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {getDisplayLabel(notification)}
                  </Badge>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-normal leading-relaxed text-gray-dark">
                  {notification.description}
                </p>
              </div>
            ))}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end px-3 py-1">
        <Button
          variant="unstyled"
          className="px-0 text-sm font-bold text-primary"
          onClick={() => {
            void setIsDrawerOpen(true);
          }}
        >
          {t("viewMore")}
          <ChevronRight className="size-4" />
        </Button>
      </CardFooter>
      {/* <div className="mb-2 mt-2 flex justify-end px-6">
        <Button
          variant="unstyled"
          className="text-primary px-0 text-sm font-medium"
          onClick={() => {
            void setIsDrawerOpen(true);
          }}
        >
          {t("viewMore")}
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div> */}
    </Card>
  );
}
