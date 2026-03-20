"use client";

import { decodeHTMLEntities } from "@cf/common";
import { useAsyncEffect, useInitializedEffect } from "@cf/common/hooks";
import { Button } from "@cf/ui";
import {
  type Notification as NovuNotification,
  Novu,
  SeverityLevelEnum,
} from "@novu/js";
import { BellRing } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { create } from "zustand";

import { logger } from "@/lib/logger";
import { getNotificationBody } from "@/lib/notifications/display-utils";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

import { getNotificationCtaLabel, notificationHasCta } from "./display-utils";
import {
  getWorkflowCategory,
  getWorkflowPath,
  NOTIFICATION_CATEGORY_BY_TAG,
  type NotificationCategory,
  type NotificationWorkflow,
  toNotificationWorkflowIdentifier,
} from "./workflow-config";

const MAX_NOTIFICATIONS = 60;
const htmlTagPattern = /<[^>]+>/g;

const sanitizeContent = (value: string) =>
  value.replace(htmlTagPattern, " ").replace(/\s+/g, " ").trim();

const sanitizeAndDecodeContent = (value: string) =>
  decodeHTMLEntities(sanitizeContent(value));

const computeUnreadCount = (items: NotificationItem[]) =>
  items.reduce((count, item) => (item.isRead ? count : count + 1), 0);

const resolveWorkflowIdentifier = (
  notification: NovuNotification,
): NotificationWorkflow | null => {
  const workflow = notification.workflow as
    | {
        identifier?: string | null;
        name?: string | null;
      }
    | undefined;

  const templateIdentifier = (
    notification as {
      templateIdentifier?: string | null;
    }
  ).templateIdentifier;

  const result =
    toNotificationWorkflowIdentifier(workflow?.identifier ?? null) ??
    toNotificationWorkflowIdentifier(workflow?.name ?? null) ??
    toNotificationWorkflowIdentifier(templateIdentifier ?? null);

  return result;
};

const deriveCategory = (
  notification: NovuNotification,
  normalizedTags: string[],
): NotificationCategory | null => {
  const workflowIdentifier = resolveWorkflowIdentifier(notification);
  const categoryFromWorkflow = getWorkflowCategory(workflowIdentifier);
  if (categoryFromWorkflow) {
    return categoryFromWorkflow;
  }

  for (const tag of normalizedTags) {
    const mappedCategory = NOTIFICATION_CATEGORY_BY_TAG[tag];
    if (mappedCategory) {
      return mappedCategory;
    }
  }

  if (notification.severity === SeverityLevelEnum.HIGH) {
    return "Alert";
  }

  return null;
};

export interface NotificationItem {
  id: string;
  description: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  isSeen: boolean;
  tags: string[];
  category: NotificationCategory | null;
  severity: SeverityLevelEnum;
  workflowIdentifier: NotificationWorkflow | null;
  workflowName?: string;
  subject?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  payload?: Record<string, unknown>;
  original: NovuNotification;
}

const mapNotification = (
  notification: NovuNotification,
  previous?: NotificationItem,
): NotificationItem => {
  const rawTags = notification.tags ?? previous?.tags ?? [];
  const normalizedTags = rawTags.map((tag) =>
    typeof tag === "string" ? tag.toLowerCase() : tag,
  );

  const derivedWorkflowIdentifier = resolveWorkflowIdentifier(notification);
  const workflowIdentifier =
    derivedWorkflowIdentifier ?? previous?.workflowIdentifier ?? null;

  const category =
    deriveCategory(notification, normalizedTags) ?? previous?.category ?? null;

  const rawSubject = notification.subject?.trim() ?? previous?.subject;
  const subject = rawSubject ? decodeHTMLEntities(rawSubject) : rawSubject;
  const body =
    typeof notification.body === "string"
      ? sanitizeAndDecodeContent(notification.body)
      : (previous?.body ?? "");

  const to = notification.to;
  const description = subject && subject.length > 0 ? subject : body;

  return {
    id: notification.id,
    description,
    body,
    createdAt: notification.createdAt,
    isRead: notification.isRead ?? previous?.isRead ?? false,
    isSeen: notification.isSeen ?? previous?.isSeen ?? false,
    tags: normalizedTags,
    category,
    severity:
      notification.severity ?? previous?.severity ?? SeverityLevelEnum.LOW,
    workflowIdentifier,
    workflowName: notification.workflow?.name ?? previous?.workflowName,
    subject,
    firstName: to?.firstName?.trim() || previous?.firstName,
    lastName: to?.lastName?.trim() || previous?.lastName,
    email: to?.email?.trim() || previous?.email,
    phone: to?.phone?.trim() || previous?.phone,
    payload: notification.data ?? previous?.payload,
    original: notification,
  };
};

interface NotificationsState {
  notifications: NotificationItem[];
  isLoading: boolean;
  isInitialized: boolean;
  isRealtimeConnected: boolean;
  unreadCount: number;
  totalCount: number;
  error: string | null;
  refreshToken: number;
  lastRealtimeNotificationId: string | null;
  setNotifications: (items: NotificationItem[]) => void;
  setLoading: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  setRealtimeConnected: (value: boolean) => void;
  setUnreadCount: (value: number) => void;
  setTotalCount: (value: number) => void;
  setError: (value: string | null) => void;
  setLastRealtimeNotificationId: (value: string | null) => void;
  incrementRefreshToken: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  isLoading: false,
  isInitialized: false,
  isRealtimeConnected: false,
  unreadCount: 0,
  totalCount: 0,
  error: null,
  refreshToken: 0,
  lastRealtimeNotificationId: null,
  setNotifications: (items) =>
    set(() => ({
      notifications: [...items],
      unreadCount: computeUnreadCount(items),
    })),
  setLoading: (value) => set({ isLoading: value }),
  setInitialized: (value) => set({ isInitialized: value }),
  setRealtimeConnected: (value) => set({ isRealtimeConnected: value }),
  setUnreadCount: (value) => set({ unreadCount: value }),
  setTotalCount: (value) => set({ totalCount: value }),
  setError: (value) => set({ error: value }),
  setLastRealtimeNotificationId: (value) =>
    set({ lastRealtimeNotificationId: value }),
  incrementRefreshToken: () =>
    set((state) => ({ refreshToken: state.refreshToken + 1 })),
}));

export const useNotifications = () => {
  const notifications = useNotificationsStore((state) => state.notifications);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const totalCount = useNotificationsStore((state) => state.totalCount);
  const isInitialized = useNotificationsStore((state) => state.isInitialized);
  const isRealtimeConnected = useNotificationsStore(
    (state) => state.isRealtimeConnected,
  );
  const error = useNotificationsStore((state) => state.error);
  const lastRealtimeNotificationId = useNotificationsStore(
    (state) => state.lastRealtimeNotificationId,
  );

  return useMemo(
    () => ({
      notifications,
      isLoading,
      unreadCount,
      totalCount,
      isInitialized,
      isRealtimeConnected,
      error,
      lastRealtimeNotificationId,
    }),
    [
      notifications,
      isLoading,
      unreadCount,
      totalCount,
      isInitialized,
      isRealtimeConnected,
      error,
      lastRealtimeNotificationId,
    ],
  );
};

let novuClientRef: Novu | null = null;
let unsubscribersRef: (() => void)[] = [];

const updateNotifications = (
  updater: (items: NotificationItem[]) => NotificationItem[],
  options?: { recomputeCount?: boolean; countDelta?: number },
) => {
  useNotificationsStore.setState((state) => {
    // Ensure we always create a new array to trigger re-renders
    const items = [...updater(state.notifications)];

    // Determine new unread count
    let newUnreadCount = state.unreadCount;
    if (options?.recomputeCount) {
      // Recompute from local items (only when loading from server)
      newUnreadCount = computeUnreadCount(items);
    } else if (options?.countDelta !== undefined) {
      // Apply delta (for delete/mark as read)
      newUnreadCount = Math.max(0, state.unreadCount + options.countDelta);
    }

    return {
      notifications: items,
      unreadCount: newUnreadCount,
    };
  });
};

const applyNotifications = (items: NotificationItem[]) => {
  useNotificationsStore.getState().setNotifications(items);
};

const loadNotifications = async ({
  useCache,
  withSpinner,
}: {
  useCache: boolean;
  withSpinner: boolean;
}) => {
  const client = novuClientRef;
  if (!client) {
    return;
  }

  const { setLoading, setError, setInitialized } =
    useNotificationsStore.getState();

  if (withSpinner) {
    setLoading(true);
  }

  try {
    const response = await client.notifications.list({
      limit: MAX_NOTIFICATIONS,
      useCache,
    });
    if (response.error) {
      throw response.error;
    }
    const list = response.data?.notifications ?? [];
    const existingById = new Map(
      useNotificationsStore
        .getState()
        .notifications.map((item) => [item.id, item] as const),
    );
    const mapped = list.map((item) =>
      mapNotification(item, existingById.get(item.id)),
    );
    applyNotifications(mapped);
    setError(null);
    setInitialized(true);

    // Fetch server-authoritative count after loading notifications
    void fetchNotificationCounts();
  } catch (error) {
    setError("Unable to load notifications");
    applyNotifications([]);
    logger.error("Failed to load notifications", { error });
  } finally {
    if (withSpinner) {
      setLoading(false);
    }
  }
};

const fetchNotificationCounts = async () => {
  const client = novuClientRef;
  if (!client) {
    return;
  }

  try {
    // Fetch both total and unread counts from Novu API
    const [totalResponse, unreadResponse] = await Promise.all([
      client.notifications.count({}), // No filters = total count
      client.notifications.count({ read: false }), // Unread only
    ]);

    if (totalResponse.error) {
      throw totalResponse.error;
    }
    if (unreadResponse.error) {
      throw unreadResponse.error;
    }

    const totalCount = totalResponse.data?.count ?? 0;
    const unreadCount = unreadResponse.data?.count ?? 0;

    useNotificationsStore.getState().setTotalCount(totalCount);
    useNotificationsStore.getState().setUnreadCount(unreadCount);
  } catch (error) {
    logger.error("Failed to fetch notification counts", { error });
    // Fallback to local computation if API call fails
    const notifications = useNotificationsStore.getState().notifications;
    const localUnreadCount = computeUnreadCount(notifications);
    const localTotalCount = notifications.length;

    useNotificationsStore.getState().setUnreadCount(localUnreadCount);
    useNotificationsStore.getState().setTotalCount(localTotalCount);
  }
};

const disconnectNotificationsClient = () => {
  unsubscribersRef.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      logger.error("Failed to unsubscribe from Novu event", { error });
    }
  });
  unsubscribersRef = [];

  const client = novuClientRef;
  novuClientRef = null;
  if (client?.socket) {
    void client.socket.disconnect();
  }

  useNotificationsStore.getState().setRealtimeConnected(false);
  useNotificationsStore.getState().setLastRealtimeNotificationId(null);
};

const connectNotificationsClient = (options: {
  applicationIdentifier: string;
  subscriber: string;
  apiUrl?: string;
  socketUrl?: string;
}) => {
  disconnectNotificationsClient();

  const novuClient = new Novu(options);
  novuClientRef = novuClient;

  const applyRealtimeNotification = (notification: NovuNotification) => {
    // Check if notification lacks workflow data
    const hasWorkflowData = !!(
      notification.workflow?.identifier ||
      notification.workflow?.name ||
      (notification as any).templateIdentifier
    );

    if (!hasWorkflowData) {
      // Add the notification temporarily for immediate feedback
      const existing = useNotificationsStore
        .getState()
        .notifications.find((item) => item.id === notification.id);
      const mapped = mapNotification(notification, existing);

      updateNotifications((current) => {
        const filtered = current.filter((item) => item.id !== mapped.id);
        return [mapped, ...filtered].slice(0, MAX_NOTIFICATIONS);
      });

      // Trigger refresh to get full notification data with workflow
      setTimeout(() => {
        void handleRealtimeRefresh();
      }, 500); // Small delay to ensure notification is processed

      // Set as last realtime notification even without workflow
      // The toast will show with CTA that uses fallback destination
      useNotificationsStore.getState().setLastRealtimeNotificationId(mapped.id);
      return;
    }

    // Continue with existing logic for notifications with workflow data
    const existing = useNotificationsStore
      .getState()
      .notifications.find((item) => item.id === notification.id);
    const mapped = mapNotification(notification, existing);

    updateNotifications((current) => {
      const filtered = current.filter((item) => item.id !== mapped.id);
      return [mapped, ...filtered].slice(0, MAX_NOTIFICATIONS);
    });

    // Always set as last realtime notification to show toast
    // If no workflow, CTA will use fallback destination
    useNotificationsStore.getState().setLastRealtimeNotificationId(mapped.id);
  };

  const handleRealtimeRefresh = async () => {
    await loadNotifications({ useCache: false, withSpinner: false });
  };

  const unsubscribeReceived = novuClient.on(
    "notifications.notification_received",
    ({ result }) => {
      applyRealtimeNotification(result);
    },
  );
  const unsubscribeUnread = novuClient.on(
    "notifications.unread_count_changed",
    ({ result }) => {
      const unreadTotal =
        typeof result?.total === "number" ? result.total : null;
      if (unreadTotal !== null) {
        useNotificationsStore.setState({ unreadCount: unreadTotal });
      } else {
        void handleRealtimeRefresh();
      }
    },
  );
  const unsubscribeUnseen = novuClient.on(
    "notifications.unseen_count_changed",
    () => {
      void handleRealtimeRefresh();
    },
  );
  const unsubscribeListUpdated = novuClient.on(
    "notifications.list.updated",
    ({ data }) => {
      const existingById = new Map(
        useNotificationsStore
          .getState()
          .notifications.map((item) => [item.id, item] as const),
      );
      const items = (data.notifications ?? []).map((item) =>
        mapNotification(item, existingById.get(item.id)),
      );
      applyNotifications(items);
    },
  );

  unsubscribersRef = [
    unsubscribeReceived,
    unsubscribeUnread,
    unsubscribeUnseen,
    unsubscribeListUpdated,
  ];

  useNotificationsStore.getState().setRealtimeConnected(true);
};

const deleteNotification = async (notificationId: string) => {
  const client = novuClientRef;
  if (!client) {
    return;
  }

  const previous = [...useNotificationsStore.getState().notifications];
  const deletedNotification = previous.find(
    (item) => item.id === notificationId,
  );

  // Optimistically update: remove notification and decrement count if it was unread
  const countDelta =
    deletedNotification && !deletedNotification.isRead ? -1 : 0;
  updateNotifications(
    (items) => items.filter((item) => item.id !== notificationId),
    { countDelta },
  );

  try {
    const result = await client.notifications.delete({ notificationId });
    if (result.error) {
      throw result.error;
    }

    // Fetch fresh count from server to ensure accuracy
    void fetchNotificationCounts();
  } catch (error) {
    logger.error("Failed to delete notification", {
      error,
      notificationId,
    });
    applyNotifications(previous);
    useNotificationsStore.getState().setError("Failed to delete notification");
    throw error;
  }
};

const markAsRead = async (notificationId: string) => {
  const client = novuClientRef;
  if (!client) {
    return;
  }

  const existing = useNotificationsStore
    .getState()
    .notifications.find((item) => item.id === notificationId);

  // Optimistically mark as read and decrement count if it was unread
  const countDelta = existing && !existing.isRead ? -1 : 0;
  updateNotifications(
    (items) =>
      items.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true, isSeen: true }
          : item,
      ),
    { countDelta },
  );

  try {
    const originalNotification = existing?.original;
    const result =
      originalNotification && typeof originalNotification.read === "function"
        ? await originalNotification.read()
        : await client.notifications.read({ notificationId });
    if (result.error) {
      throw result.error;
    }
    const updated = result.data ? mapNotification(result.data, existing) : null;
    if (updated) {
      // Preserve workflow identifier if it exists in the current notification but not in the API response
      const preservedUpdate: NotificationItem = {
        ...updated,
        workflowIdentifier:
          updated.workflowIdentifier || existing?.workflowIdentifier || null,
        workflowName: updated.workflowName || existing?.workflowName,
        category: updated.category || existing?.category || null,
      };

      // Update notification data without changing count (already updated above)
      updateNotifications((items) =>
        items.map((item) =>
          item.id === preservedUpdate.id ? preservedUpdate : item,
        ),
      );
    }

    // Fetch fresh count from server to ensure accuracy
    void fetchNotificationCounts();
  } catch (error) {
    logger.error("Failed to mark notification as read", {
      error,
      notificationId,
    });
    await loadNotifications({ useCache: false, withSpinner: false });
    throw error;
  }
};

const markAsSeen = async (notificationId: string) => {
  const client = novuClientRef;
  if (!client) {
    return;
  }

  const existing = useNotificationsStore
    .getState()
    .notifications.find((item) => item.id === notificationId);

  updateNotifications((items) =>
    items.map((item) =>
      item.id === notificationId ? { ...item, isSeen: true } : item,
    ),
  );

  try {
    const originalNotification = existing?.original;
    const result =
      originalNotification && typeof originalNotification.seen === "function"
        ? await originalNotification.seen()
        : await client.notifications.seen({ notificationId });
    if (result.error) {
      throw result.error;
    }
    const updated = result.data ? mapNotification(result.data, existing) : null;
    if (updated) {
      // Preserve workflow identifier if it exists in the current notification but not in the API response
      const preservedUpdate: NotificationItem = {
        ...updated,
        workflowIdentifier:
          updated.workflowIdentifier || existing?.workflowIdentifier || null,
        workflowName: updated.workflowName || existing?.workflowName,
        category: updated.category || existing?.category || null,
      };

      updateNotifications((items) =>
        items.map((item) =>
          item.id === preservedUpdate.id ? preservedUpdate : item,
        ),
      );
    }
  } catch (error) {
    logger.error("Failed to mark notification as seen", {
      error,
      notificationId,
    });
    throw error;
  }
};

export const notificationsActions = {
  refresh: async ({ useCache = false }: { useCache?: boolean } = {}) => {
    await loadNotifications({ useCache, withSpinner: true });
  },
  deleteNotification,
  markAsRead,
  markAsSeen,
};

interface NotificationNavigationRouter {
  push: (href: string) => void;
}

export async function navigateNotificationDestination({
  notification,
  locale,
  router,
}: {
  notification: NotificationItem;
  locale: string;
  router: NotificationNavigationRouter;
}): Promise<boolean> {
  const destinationPath = getWorkflowPath(
    notification.workflowIdentifier,
    locale,
    notification.payload,
  );

  // Use fallback destination if no specific path is configured
  const finalPath = destinationPath || `/${locale}/dashboard`;

  if (!destinationPath) {
    logger.info("Using fallback destination for notification", {
      notificationId: notification.id,
      workflowIdentifier: notification.workflowIdentifier,
      fallbackPath: finalPath,
    });
  }

  try {
    await markAsRead(notification.id);
  } catch (error) {
    logger.error("Failed to mark notification as read before navigation", {
      error,
      notificationId: notification.id,
    });
  }

  try {
    await markAsSeen(notification.id);
  } catch (error) {
    logger.error("Failed to mark notification as seen before navigation", {
      error,
      notificationId: notification.id,
    });
  }

  router.push(finalPath);
  return true;
}

export function NotificationsManager({ children }: { children: ReactNode }) {
  const { userId } = useAuthUser();
  const appIdentifier = process.env.NEXT_PUBLIC_NOVU_APP_IDENTIFIER;
  const apiUrl = process.env.NEXT_PUBLIC_NOVU_API_URL;
  const socketUrl = process.env.NEXT_PUBLIC_NOVU_SOCKET_URL;

  const { notifications, isInitialized, lastRealtimeNotificationId } =
    useNotifications();
  const setLastRealtimeNotificationId = useNotificationsStore(
    (state) => state.setLastRealtimeNotificationId,
  );
  const refreshToken = useNotificationsStore((state) => state.refreshToken);
  const setNotifications = useNotificationsStore(
    (state) => state.setNotifications,
  );
  const setInitialized = useNotificationsStore((state) => state.setInitialized);
  const setError = useNotificationsStore((state) => state.setError);
  const incrementRefreshToken = useNotificationsStore(
    (state) => state.incrementRefreshToken,
  );

  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("dashboard.notifications");
  const hasRequestedInitialLoadRef = useRef(false);

  useInitializedEffect(() => {
    hasRequestedInitialLoadRef.current = false;
    incrementRefreshToken();
  }, [incrementRefreshToken, userId]);

  useEffect(() => {
    if (!appIdentifier || !userId) {
      disconnectNotificationsClient();
      setNotifications([]);
      setInitialized(false);
      setError(null);
      return;
    }

    const options = {
      applicationIdentifier: appIdentifier,
      subscriber: userId,
      ...(apiUrl ? { apiUrl } : {}),
      ...(socketUrl ? { socketUrl } : {}),
    };

    try {
      connectNotificationsClient(options);
      hasRequestedInitialLoadRef.current = false;
      incrementRefreshToken();
    } catch (error) {
      logger.error("Failed to initialize Novu client", { error });
      setError("Unable to initialize notifications");
    }

    return () => {
      disconnectNotificationsClient();
    };
  }, [
    appIdentifier,
    apiUrl,
    socketUrl,
    userId,
    incrementRefreshToken,
    setError,
    setInitialized,
    setNotifications,
  ]);

  useAsyncEffect(async () => {
    if (!novuClientRef || !userId || !appIdentifier) {
      setNotifications([]);
      return;
    }

    const withSpinner = !hasRequestedInitialLoadRef.current;
    hasRequestedInitialLoadRef.current = true;

    await loadNotifications({
      useCache: false,
      withSpinner,
    });
  }, [appIdentifier, refreshToken, setNotifications, userId]);

  useEffect(() => {
    if (!isInitialized || !lastRealtimeNotificationId) {
      return;
    }

    const notification = notifications.find(
      (item) => item.id === lastRealtimeNotificationId,
    );

    if (!notification) {
      setLastRealtimeNotificationId(null);
      return;
    }

    const label = getNotificationBody(notification);

    const ctaLabel = getNotificationCtaLabel(notification, (key: string) =>
      t(key as never),
    );
    const hasCta = notificationHasCta(notification);

    toast.custom(
      (toastId) => {
        const handleDismiss = () => toast.dismiss(toastId);

        const handleNavigate = () => {
          handleDismiss();

          // Get the latest notification from the store to ensure we have the updated data
          // This is important because realtime notifications initially lack workflow data
          const currentNotification = useNotificationsStore
            .getState()
            .notifications.find((n) => n.id === notification.id);

          if (currentNotification) {
            void navigateNotificationDestination({
              notification: currentNotification,
              locale,
              router,
            });
          }
        };

        return (
          <div className="flex w-full max-w-full items-center justify-between gap-2 rounded-lg bg-[#0063EA] px-2  py-2 text-white shadow-lg">
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
              <BellRing className="shrink-6 size-6" aria-hidden="true" />
              <p className="truncate text-sm font-medium">{label}</p>
            </div>
            {hasCta ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="px-4 font-bold text-white hover:text-white/90"
                onClick={handleNavigate}
              >
                {ctaLabel}
              </Button>
            ) : null}
          </div>
        );
      },
      { duration: 7000 },
    );

    setLastRealtimeNotificationId(null);
  }, [
    isInitialized,
    lastRealtimeNotificationId,
    locale,
    notifications,
    router,
    setLastRealtimeNotificationId,
    t,
  ]);

  return <>{children}</>;
}
