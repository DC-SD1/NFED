"use client";

import {
  Button,
  cn,
  Drawer,
  DrawerContent,
  Input,
  ScrollArea,
  Sheet,
  SheetContent,
} from "@cf/ui";
import { BellRing, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { type KeyboardEvent, useCallback, useMemo, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { logger } from "@/lib/logger";
import {
  getNotificationCtaLabel,
  getNotificationLabel,
  notificationHasCta,
} from "@/lib/notifications/display-utils";
import {
  navigateNotificationDestination,
  type NotificationItem,
  notificationsActions,
  useNotifications,
} from "@/lib/notifications/notifications-store";

interface NotificationGroup {
  key: string;
  label: string;
  items: NotificationItem[];
}

const SEARCHABLE_FIELDS: ((
  item: NotificationItem,
) => string | null | undefined)[] = [
  (item) => item.description,
  (item) => item.body,
  (item) => item.subject,
  (item) => item.workflowName,
  (item) => item.firstName,
  (item) => item.lastName,
  (item) => item.email,
  (item) => item.phone,
  (item) => item.tags.join(" "),
];

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export default function NotificationsDrawer() {
  const locale = useLocale();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { notifications } = useNotifications();
  const { deleteNotification, markAsRead, markAsSeen } = notificationsActions;
  const [isDrawerOpen, setIsDrawerOpen] = useQueryState(
    "notificationsDrawer",
    parseAsBoolean.withDefault(false),
  );
  const [searchTerm, setSearchTerm] = useQueryState(
    "notificationsSearch",
    parseAsString.withDefault(""),
  );
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const { groups, isEmpty, hasNoMatches } = useNotificationFilter(
    notifications,
    searchTerm,
    locale,
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      void setSearchTerm(event.target.value);
    },
    [setSearchTerm],
  );

  const handleClearSearch = useCallback(() => {
    void setSearchTerm("");
  }, [setSearchTerm]);

  const handleToggle = useCallback(
    async (id: string, nextOpen: boolean, isRead: boolean) => {
      setExpandedIds((current) => {
        if (nextOpen) return current.includes(id) ? current : [...current, id];
        return current.filter((value) => value !== id);
      });

      if (!nextOpen) return;
      try {
        if (!isRead) await markAsRead(id);
        await markAsSeen(id);
      } catch (error) {
        logger.error("Failed to update notification state", {
          error,
          notificationId: id,
        });
      }
    },
    [markAsRead, markAsSeen],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setExpandedIds((current) => current.filter((value) => value !== id));
      try {
        await deleteNotification(id);
      } catch (error) {
        logger.error("Failed to delete notification from drawer", {
          error,
          notificationId: id,
        });
      }
    },
    [deleteNotification],
  );

  const handleCtaClick = useCallback(
    async (notification: NotificationItem) => {
      await setIsDrawerOpen(false);
      await navigateNotificationDestination({
        notification,
        locale,
        router,
      });
    },
    [locale, router, setIsDrawerOpen],
  );

  const closeDrawer = useCallback(() => {
    void setIsDrawerOpen(false);
  }, [setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  const body = (
    <DrawerBody
      searchValue={searchTerm}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      onClose={closeDrawer}
      groups={groups}
      expandedIds={expandedIds}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onCtaClick={handleCtaClick}
      locale={locale}
      isEmpty={isEmpty}
      hasNoMatches={hasNoMatches}
    />
  );

  if (isMobile) {
    return (
      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => void setIsDrawerOpen(open)}
      >
        <DrawerContent className="mt-0 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden rounded-t-[24px] border-none bg-[#FBFBFB] p-0">
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet
      open={isDrawerOpen}
      onOpenChange={(open) => void setIsDrawerOpen(open)}
    >
      <SheetContent
        side="right"
        hideCloseButton
        className="my-auto flex h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-l-[24px] bg-[#FBFBFB] p-0"
      >
        {body}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  searchValue,
  onSearchChange,
  onClearSearch,
  onClose,
  groups,
  expandedIds,
  onToggle,
  onDelete,
  onCtaClick,
  locale,
  isEmpty,
  hasNoMatches,
}: {
  searchValue: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onClose: () => void;
  groups: NotificationGroup[];
  expandedIds: string[];
  onToggle: (id: string, nextOpen: boolean, isRead: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCtaClick: (notification: NotificationItem) => Promise<void>;
  locale: string;
  isEmpty: boolean;
  hasNoMatches: boolean;
}) {
  const t = useTranslations("dashboard.notifications");

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-4">
        <div className={cn("flex h-10 items-center rounded-2xl bg-white px-2")}>
          <div className="mr-auto flex items-start">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-foreground size-9 justify-start rounded-full hover:bg-transparent"
              onClick={onClose}
            >
              <X className="size-6" />
            </Button>
          </div>
          <p className={cn("text-foreground text-sm font-bold")}>
            {t("modalTitle")}
          </p>
          <div className="ml-auto flex items-center" />
        </div>
        <div className="relative mt-4 px-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={searchValue}
            onChange={onSearchChange}
            placeholder={t("searchPlaceholder")}
            className="bg-primary-light h-12 rounded-xl border-black pl-8 pr-12 placeholder:text-[#525C4E]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          <DrawerEmptyState />
        ) : hasNoMatches ? (
          <DrawerNoResultsState onClear={onClearSearch} />
        ) : (
          <ScrollArea className="h-full px-4 py-4">
            <NotificationGroupList
              groups={groups}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onDelete={onDelete}
              onCtaClick={onCtaClick}
              locale={locale}
            />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

const DrawerEmptyState = () => {
  const t = useTranslations("dashboard.notifications");

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <BellRing className="text-muted-foreground mb-6 size-12" />
      <h3 className="text-lg font-semibold">{t("emptyDrawerTitle")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("emptyDrawerSubtitle")}
      </p>
    </div>
  );
};

const DrawerNoResultsState = ({ onClear }: { onClear: () => void }) => {
  const t = useTranslations("dashboard.notifications");

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <Search className="text-muted-foreground mb-6 size-12" />
      <h3 className="text-lg font-semibold">{t("noResultsTitle")}</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("noResultsSubtitle")}
      </p>
      <Button variant="ghost" className="mt-4" onClick={onClear}>
        {t("clearSearch")}
      </Button>
    </div>
  );
};

function NotificationGroupList({
  groups,
  expandedIds,
  onToggle,
  onDelete,
  onCtaClick,
  locale,
}: {
  groups: NotificationGroup[];
  expandedIds: string[];
  onToggle: (id: string, nextOpen: boolean, isRead: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCtaClick: (notification: NotificationItem) => Promise<void>;
  locale: string;
}) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key} className="space-y-3">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {group.label}
          </p>
          <div className="space-y-3">
            {group.items.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                isExpanded={expandedIds.includes(notification.id)}
                onToggle={onToggle}
                onDelete={onDelete}
                onCtaClick={onCtaClick}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationListItem({
  notification,
  isExpanded,
  onToggle,
  onDelete,
  onCtaClick,
  locale,
}: {
  notification: NotificationItem;
  isExpanded: boolean;
  onToggle: (id: string, nextOpen: boolean, isRead: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCtaClick: (notification: NotificationItem) => Promise<void>;
  locale: string;
}) {
  const t = useTranslations("dashboard.notifications");
  const hasCta = notificationHasCta(notification);

  const handleToggle = () =>
    onToggle(notification.id, !isExpanded, notification.isRead);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void handleToggle();
    }
  };

  return (
    <div className="border-b border-gray-200 py-4">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        className="focus-visible:ring-primary focus-visible:ring-offset-background flex w-full items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        onClick={() => void handleToggle()}
        onKeyDown={handleKeyDown}
      >
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--blue-light))]">
          <BellRing className="size-5 text-[hsl(var(--blue-dark))]" />
        </div>

        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-semibold text-gray-900">
              {getNotificationLabel(notification, (key: string) =>
                t(key as any),
              )}
            </p>
            <p
              className={cn(
                "text-sm text-gray-600",
                !isExpanded && "line-clamp-1",
              )}
            >
              {notification.body}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="text-xs text-gray-500">
              {formatTime(locale, notification.createdAt)}
            </p>
            {isExpanded && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 text-[#BA1A1A] hover:bg-red-50 hover:text-red-500"
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete(notification.id);
                }}
                aria-label={t("deleteLabel")}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasCta && (
        <div className="ml-[52px] mt-3">
          <Button
            type="button"
            size="sm"
            className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium text-white"
            onClick={() => void onCtaClick(notification)}
          >
            {getNotificationCtaLabel(notification, (key: string) =>
              t(key as any),
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function useNotificationFilter(
  notifications: NotificationItem[],
  searchTerm: string,
  locale: string,
) {
  const t = useTranslations("dashboard.notifications");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const hasSearchTerm = normalizedSearch.length > 0;

  const filtered = useMemo(() => {
    if (!hasSearchTerm) return notifications;
    return notifications.filter((notification) =>
      SEARCHABLE_FIELDS.some((getter) => {
        const value = getter(notification);
        return value ? value.toLowerCase().includes(normalizedSearch) : false;
      }),
    );
  }, [notifications, hasSearchTerm, normalizedSearch]);

  const groups = useMemo<NotificationGroup[]>(() => {
    if (filtered.length === 0) return [];
    const now = new Date();
    const today: NotificationItem[] = [];
    const dated = new Map<
      string,
      { label: string; items: NotificationItem[]; sortValue: number }
    >();
    const unknown: NotificationItem[] = [];

    filtered
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .forEach((notification) => {
        const createdAt = new Date(notification.createdAt);
        if (Number.isNaN(createdAt.getTime())) {
          unknown.push(notification);
          return;
        }
        if (isSameDay(createdAt, now)) {
          today.push(notification);
          return;
        }
        const key = createdAt.toISOString().slice(0, 10);
        const entry = dated.get(key);
        if (entry) {
          entry.items.push(notification);
        } else {
          dated.set(key, {
            label: new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(createdAt),
            items: [notification],
            sortValue: createdAt.getTime(),
          });
        }
      });

    const ordered = Array.from(dated.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.sortValue - a.sortValue);

    const result: NotificationGroup[] = [];
    if (today.length > 0)
      result.push({ key: "today", label: t("today"), items: today });
    ordered.forEach(({ key, label, items }) =>
      result.push({ key, label, items }),
    );
    if (unknown.length > 0)
      result.push({
        key: "unknown",
        label: t("unknownDate"),
        items: unknown,
      });
    return result;
  }, [filtered, locale, t]);

  return {
    groups,
    isEmpty: notifications.length === 0,
    hasNoMatches: filtered.length === 0 && notifications.length > 0,
  };
}

function formatTime(locale: string, isoDate: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(isoDate));
}
