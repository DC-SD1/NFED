import { Dashboard, FarmLands, FarmManagerTab, User, Users } from "@cf/ui";
import { type Icon, Wallet } from "@cf/ui/icons";
import type { LucideIcon } from "lucide-react";
import { ClipboardList, Settings, TreePine, UserPlus } from "lucide-react";

import { ROLES, type ValidRole } from "@/lib/schemas/auth";

export interface NavigationItem {
  id: string;
  label: string;
  pageTitle?: string;
  href: string;
  icon: LucideIcon | Icon;
  badge?: number;
  disabled?: boolean;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  showInBottomNav?: boolean;
  children?: NavigationItem[];
}

export interface NavigationSection {
  id: string;
  label?: string;
  items: NavigationItem[];
  showInSidebar?: boolean;
  showInBottomNav?: boolean;
}

export interface LayoutConfig {
  hideBottomNav?: string[];
  hideHeaderNav?: string[]; // Hides on both mobile and desktop
  hideHeaderNavMobile?: string[]; // Hides only on mobile
  hideHeaderNavDesktop?: string[]; // Hides only on desktop
  removePadding?: string[];
  useSmallPadding?: string[];
}

export interface RoleNavigationConfig {
  sections: NavigationSection[];
  bottomNavItems?: string[]; // IDs of items to show in bottom nav
  defaultPath: string;
  layoutConfig?: LayoutConfig;
}

/**
 * Role-based navigation configuration
 * Each role has its own navigation structure
 */
export const NAVIGATION_CONFIG: Record<ValidRole, RoleNavigationConfig> = {
  [ROLES.FARM_OWNER]: {
    sections: [
      {
        id: "main",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            href: "/farm-owner",
            icon: Dashboard,
            showInBottomNav: true,
          },
          {
            id: "farm-lands",
            label: "Farm lands",
            href: "/farm-owner/farm-lands",
            icon: FarmLands,
            showInBottomNav: true,
            children: [
              {
                id: "grow-options",
                label: "Farming",
                href: "/farm-owner/farm-grow/*",
                icon: User,
                showInBottomNav: false,
                hideOnDesktop: true,
                hideOnMobile: true,
              },
              {
                id: "kyc",
                label: "Edit KYC",
                href: "/farm-owner/kyc/resident-edit",
                icon: User,
                showInBottomNav: true,
                hideOnDesktop: true,
                hideOnMobile: true,
              },
              {
                id: "kyc",
                label: "Submit KYC",
                href: "/farm-owner/kyc/*",
                icon: User,
                showInBottomNav: true,
                hideOnDesktop: true,
                hideOnMobile: true,
              },
              {
                id: "add-farm-lands",
                label: "Add Farm Lands",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/add",
                icon: FarmLands,
                hideOnMobile: true,
                hideOnDesktop: true,
                showInBottomNav: false,
              },
              {
                id: "upload-farm-lands",
                label: "Upload Farm Lands",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/upload",
                icon: FarmLands,
                hideOnMobile: true,
                hideOnDesktop: true,
                showInBottomNav: false,
              },
              {
                id: "confirm-farm-lands",
                label: "Confirm Farm Lands",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/upload/confirm",
                icon: FarmLands,
                hideOnMobile: true,
                hideOnDesktop: true,
                showInBottomNav: false,
              },
              {
                id: "additional-details",
                label: "Additional Details",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/upload/additional-details",
                icon: FarmLands,
                hideOnMobile: true,
                hideOnDesktop: true,
                showInBottomNav: false,
              },
              {
                id: "confirmation",
                label: "Confirmation",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/upload/confirmation",
                icon: FarmLands,
              },
              {
                id: "success",
                label: "Success",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/upload/success",
                icon: FarmLands,
              },
              {
                id: "details",
                label: "Farm Lands",
                pageTitle: "Farm lands",
                href: "/farm-owner/farm-lands/details/*",
                icon: FarmLands,
                showInBottomNav: false,
                hideOnMobile: true,
              },
            ],
          },
          {
            id: "farm-managers",
            label: "Farm Mgr",
            pageTitle: "Farm managers",
            href: "/farm-owner/farm-managers",
            icon: FarmManagerTab,
            showInBottomNav: true,
            children: [
              {
                id: "farm-manager-details",
                label: "Farm manager details",
                pageTitle: "Farm manager details",
                href: "/farm-owner/farm-managers/details",
                icon: FarmManagerTab,
                hideOnMobile: true,
                hideOnDesktop: false,
                showInBottomNav: false,
              },
              {
                id: "farm-manager-draft",
                label: "Draft details",
                pageTitle: "Draft details",
                href: "/farm-owner/farm-managers/draft",
                icon: FarmManagerTab,
                hideOnMobile: true,
                hideOnDesktop: false,
                showInBottomNav: false,
              },
              {
                id: "hire-manager",
                label: "Hire Manager",
                pageTitle: "Hire a farm manager",
                href: "/farm-owner/farm-managers/hire-manager",
                icon: UserPlus,
                hideOnMobile: true,
                showInBottomNav: false,
              },
              {
                id: "work-conditions",
                label: "Hire Manager",
                pageTitle: "Hire a farm manager",
                href: "/farm-owner/farm-managers/hire-manager/work-conditions",
                icon: UserPlus,
                hideOnMobile: true,
                showInBottomNav: false,
              },
              {
                id: "self-manager",
                label: "Farm Manager - Self Elect",
                pageTitle: "Farm Manager - Self Elect",
                href: "/farm-owner/farm-managers/assign-myself",
                icon: UserPlus,
                hideOnMobile: true,
                showInBottomNav: false,
              },
            ],
          },

          // ************************ New Transaction (Grower Wallet) ******************
          {
            id: "wallet",
            label: "Wallet",
            href: "/transaction",
            icon: Wallet,
            hideOnMobile: false,
            showInBottomNav: true,
            children: [
              {
                id: "wallet-overview",
                label: "Overview",
                href: "/transaction",
                icon: Wallet,
                showInBottomNav: false,
              },
              {
                id: "my-wallet",
                label: "My wallet",
                href: "/transaction/my-wallet",
                icon: Wallet,
                showInBottomNav: false,
              },
              {
                id: "transactions",
                label: "Transactions",
                href: "/transaction/transactions",
                icon: Wallet,
                showInBottomNav: false,
              },
            ],
          },
        ],
      },
      {
        id: "invite-managers",
        label: "Invite Managers",
        items: [
          {
            id: "invite-managers",
            label: "Invite Managers",
            pageTitle: "Farm manager",
            href: "/farm-owner/invite-managers",
            icon: UserPlus,
            hideOnMobile: true,
          },
        ],
        showInSidebar: false,
        showInBottomNav: false,
      },
      {
        id: "demo-soil-map",
        label: "Demo Soil Test",
        items: [
          {
            id: "demo-soil-map",
            label: "Demo Soil Map",
            pageTitle: "Demo Soil Map",
            href: "/demo/soil-mapp",
            icon: UserPlus,
            hideOnMobile: true,
          },
        ],
        showInSidebar: false,
        showInBottomNav: false,
      },
      {
        id: "notifications-demo",
        label: "Notifications Demo",
        items: [
          {
            id: "notifications-demo",
            label: "Notifications Demo",
            pageTitle: "Notifications Demo",
            href: "/farm-owner/notifications-demo",
            icon: Settings,
            hideOnMobile: false,
            hideOnDesktop: false,
          },
        ],
        showInSidebar: false,
        showInBottomNav: false,
      },
      {
        id: "farm-plan",
        label: "Farm Plan",
        showInSidebar: false,
        showInBottomNav: false,
        items: [
          {
            id: "production-plan",
            label: "Create farm plan",
            pageTitle: "Create farm plan",
            href: "/farm-owner/farm-plan/production-plan",
            icon: ClipboardList,
            hideOnMobile: true,
            hideOnDesktop: true,
            showInBottomNav: false,
          },
          {
            id: "select-land",
            label: "Create Farm Plan",
            pageTitle: "Create Farm Plan",
            href: "/farm-owner/farm-plan/select-land",
            icon: ClipboardList,
            hideOnMobile: true,
            hideOnDesktop: true,
            showInBottomNav: false,
          },
          {
            id: "summary",
            label: "Create Form Plan",
            pageTitle: "Create Form Plan",
            href: "/farm-owner/farm-plan/summary",
            icon: ClipboardList,
            hideOnMobile: true,
            hideOnDesktop: true,
            showInBottomNav: false,
          },
          {
            id: "farm-plan-all",
            label: "Create Form Plan",
            pageTitle: "Create Form Plan",
            href: "/farm-owner/farm-plan/*",
            icon: ClipboardList,
            hideOnMobile: true,
            hideOnDesktop: true,
            showInBottomNav: false,
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        items: [
          {
            id: "profile",
            label: "Profile",
            href: "/profile",
            icon: User,
          },
          {
            id: "account-settings",
            label: "Account settings",
            href: "/account-settings",
            icon: User,
          },
          {
            id: "settings",
            label: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ],
        showInSidebar: false,
        showInBottomNav: false,
      },
    ],
    bottomNavItems: ["dashboard", "farm-lands", "farm-managers"],
    defaultPath: "/farm-owner",
    layoutConfig: {
      hideBottomNav: [
        "/onboarding",
        "/settings",
        "/profile",
        "/farm-owner/farm-plan/production-plan",
        "/farm-owner/farm-plan/select-land",
        "/farm-owner/invite-farm-manager",
        "/farm-owner/farm-lands/upload",
        "/farm-owner/farm-managers/delete-success",
        "/farm-owner/farm-lands/details",
        "/farm-owner/farm-managers/hire-manager",
        "/farm-owner/farm-managers/assign-myself",
        "/farm-owner/farm-managers/hire-manager/success",
        "/farm-owner/farm-managers/assign-myself/success",
        "/farm-owner/farm-plan/summary",
        "/farm-owner/farm-plan/success",
        "/farm-owner/farm-plan/*",
        "/farm-owner/farm-grow/*",
      ],
      hideHeaderNav: [
        "/farm-owner/draft-complete",
        "/farm-owner/invite-complete",
        "/farm-owner/farm-lands/upload/success",
        "/farm-owner/farm-managers/delete-success",
        "/farm-owner/farm-managers/hire-manager/success",
        "/farm-owner/farm-managers/assign-myself/success",
        "/farm-owner/farm-plan/success",
        "/farm-owner/farm-grow/success",
      ],
      hideHeaderNavMobile: [
        "/farm-owner/farm-plan/production-plan",
        "/farm-owner/farm-plan/select-land",
        "/farm-owner/farm-plan/summary",
        "/farm-owner/farm-plan/*",
        "/farm-owner/farm-grow/success",
        "/farm-owner/farm-grow/*",
      ],
      removePadding: [
        "/profile",
        "/farm-owner/draft-complete",
        "/farm-owner/invite-complete",
        "/farm-owner/farm-lands/upload/success",
        "/farm-owner/farm-managers/delete-success",
        "/farm-owner/farm-managers/hire-manager/success",
        "/farm-owner/farm-managers/assign-myself/success",
        "/farm-owner/farm-plan/summary",
        "/farm-owner/farm-plan/success",
        "/farm-owner/farm-plan/*",
        "/farm-owner/farm-grow/success",
      ],
      useSmallPadding: [
        "/farm-owner/farm-lands/upload",
        "/farm-owner/farm-lands/add",
        "/farm-owner/farm-managers",
        "/farm-owner/farm-lands",
        "/farm-owner/invite-farm-manager",
        "/farm-owner/farm-plan/*",
        "/farm-owner/farm-plan/production-plan",
        "/farm-owner/farm-plan/select-land",
        "/farm-owner/farm-plan/summary",
        "/account-settings",
        "/farm-owner/farm-grow/*",
      ],
    },
  },

  [ROLES.AGENT]: {
    sections: [
      {
        id: "main",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            href: "/agent",
            icon: Dashboard,
            showInBottomNav: true,
          },
          {
            id: "farmers",
            label: "Farmers",
            href: "/agent/farmers",
            icon: Users,
            showInBottomNav: true,
          },
          {
            id: "farm-lands",
            label: "Farm lands",
            href: "/agent/farm-lands",
            icon: FarmLands,
            showInBottomNav: true,
          },
        ],
        showInSidebar: true,
        showInBottomNav: true,
      },
      {
        id: "settings",
        label: "Settings",
        items: [
          {
            id: "profile",
            label: "Profile",
            href: "/profile",
            icon: User,
          },
          {
            id: "settings",
            label: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ],
        showInSidebar: false,
      },
    ],
    bottomNavItems: ["dashboard", "farmers", "farm-lands"],
    defaultPath: "/agent",
    layoutConfig: {
      hideBottomNav: ["/settings", "/profile"],
      hideHeaderNav: [],
      removePadding: ["/profile"],
      useSmallPadding: [],
    },
  },

  [ROLES.FARM_MANAGER]: {
    sections: [
      {
        id: "main",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            href: "/farm-manager",
            icon: Dashboard,
            showInBottomNav: true,
          },
          {
            id: "assigned-grower",
            label: "Assigned grower",
            href: "/farm-manager/assigned-grower",
            icon: TreePine,
            showInBottomNav: true,
          },
        ],
        showInSidebar: true,
        showInBottomNav: true,
      },
      {
        id: "settings",
        label: "Settings",
        items: [
          {
            id: "profile",
            label: "Profile",
            href: "/profile",
            icon: User,
          },
          {
            id: "settings",
            label: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ],
        showInSidebar: false,
      },
    ],
    bottomNavItems: ["dashboard", "assigned-grower"],
    defaultPath: "/farm-manager",
    layoutConfig: {
      hideBottomNav: ["/settings", "/profile"],
      hideHeaderNav: [],
      removePadding: ["/profile"],
      useSmallPadding: [],
    },
  },
};

/**
 * Maps child routes to their parent navigation items
 * This enables contextual navigation where child pages show their logical parent as active
 *
 * Example: All invite-farm-manager pages will show "Farm Managers" as active
 * Add new mappings here when creating flows that should inherit parent navigation state
 */
const ROUTE_PARENT_MAPPING: Record<string, string> = {
  "/farm-owner/invite-farm-manager": "farm-managers",
  "/farm-owner/hire-manager": "farm-managers",
  "/farm-owner/assign-myself": "farm-managers",
  "/farm-owner/farm-lands/upload/confirm": "farm-lands",
  "/farm-owner/farm-plan": "farm-lands",
};

/**
 * Get navigation items for bottom navigation
 */
export function getBottomNavItems(role: ValidRole): NavigationItem[] {
  const config = NAVIGATION_CONFIG[role];
  if (!config.bottomNavItems) return [];

  const items: NavigationItem[] = [];

  config.sections.forEach((section) => {
    section.items.forEach((item) => {
      if (config.bottomNavItems?.includes(item.id)) {
        items.push(item);
      }
    });
  });

  return items;
}

/**
 * Get all navigation sections for sidebar
 */
export function getSidebarSections(role: ValidRole): NavigationSection[] {
  const config = NAVIGATION_CONFIG[role];
  return config.sections.filter((section) => section.showInSidebar !== false);
}

/**
 * Check if a specific path should hide the bottom navigation
 */
export function shouldHideBottomNav(
  pathname: string,
  role: ValidRole,
): boolean {
  const config = NAVIGATION_CONFIG[role];
  const paths = config.layoutConfig?.hideBottomNav || [];

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  return paths.some((path) => {
    if (path.endsWith("/*")) {
      const basePath = path.replace("/*", "");
      return pathWithoutLocale.startsWith(basePath);
    }
    return pathWithoutLocale === path;
  });
}

/**
 * Check if a specific path should hide the header navigation
 * @param pathname - The current pathname
 * @param role - The user's role
 * @param isMobile - Optional boolean to check device-specific configuration
 */
export function shouldHideHeaderNav(
  pathname: string,
  role: ValidRole,
  isMobile?: boolean,
): boolean {
  const config = NAVIGATION_CONFIG[role];
  const layoutConfig = config.layoutConfig;

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  // Check device-specific configurations first
  const matchesPath = (rule: string, current: string): boolean => {
    if (rule.endsWith("/*")) {
      const basePath = rule.replace("/*", "");
      return current.startsWith(basePath);
    }
    return current.includes(rule);
  };

  if (isMobile !== undefined) {
    if (isMobile) {
      // Check mobile-specific array
      const mobilePaths = layoutConfig?.hideHeaderNavMobile || [];
      if (mobilePaths.some((rule) => matchesPath(rule, pathWithoutLocale))) {
        return true;
      }
    } else {
      // Check desktop-specific array
      const desktopPaths = layoutConfig?.hideHeaderNavDesktop || [];
      if (desktopPaths.some((rule) => matchesPath(rule, pathWithoutLocale))) {
        return true;
      }
    }
  }

  // Fall back to general hideHeaderNav array (hides on both mobile and desktop)
  const paths = layoutConfig?.hideHeaderNav || [];
  return paths.some((rule) => matchesPath(rule, pathWithoutLocale));
}

/**
 * Check if a specific path should remove padding
 */
export function shouldRemovePadding(
  pathname: string,
  role: ValidRole,
): boolean {
  const config = NAVIGATION_CONFIG[role];
  const paths = config.layoutConfig?.removePadding || [];

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  return paths.some((path) => pathWithoutLocale.includes(path));
}

/**
 * Check if a specific path should use small padding
 */
export function shouldUseSmallPadding(
  pathname: string,
  role: ValidRole,
): boolean {
  const config = NAVIGATION_CONFIG[role];
  const paths = config.layoutConfig?.useSmallPadding || [];

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  return paths.some((path) => {
    if (path.endsWith("/*")) {
      const basePath = path.replace("/*", "");
      return pathWithoutLocale.startsWith(basePath);
    }
    return pathWithoutLocale === path;
  });
}

/**
 * Check if a path matches a href pattern (with wildcard support)
 * @param path - The current path to check
 * @param href - The href pattern (may contain wildcards)
 * @returns true if the path matches the pattern
 */
function matchesHref(path: string, href: string): boolean {
  if (!href.includes("*")) {
    // Simple prefix match for non-wildcard hrefs
    return path.startsWith(href);
  }

  // Handle wildcard patterns
  // Convert wildcard pattern to regex
  // /farm-owner/farm-plan/* should match /farm-owner/farm-plan/anything
  const pattern = href
    .replace(/\/\*$/, "(?:/.*)?") // /* at end becomes optional /anything
    .replace(/\*/g, ".*"); // other * become .*
  const regex = new RegExp(`^${pattern}`);
  return regex.test(path);
}

/**
 * Get the active navigation item based on current path
 *
 * This function determines which navigation item should be shown as active based on the current URL.
 * It first checks if the current path has a parent mapping (for contextual navigation),
 * then falls back to finding the best matching navigation item by prefix.
 * For child routes, it returns the parent ID to ensure proper highlighting in navigation.
 * Supports wildcard patterns in href (e.g., /path/* matches /path/anything).
 *
 * @param pathname - The current pathname (may include locale prefix)
 * @param role - The user's role to get the appropriate navigation config
 * @returns The ID of the active navigation item, or null if no match found
 */
export function getActiveNavItem(
  pathname: string,
  role: ValidRole,
): string | null {
  const config = NAVIGATION_CONFIG[role];

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  // First check if this path has a parent mapping
  for (const [childPath, parentId] of Object.entries(ROUTE_PARENT_MAPPING)) {
    if (pathWithoutLocale.startsWith(childPath)) {
      return parentId;
    }
  }

  // Fall back to original prefix matching logic
  let bestMatch: {
    id: string;
    href: string;
    isChild?: boolean;
    parentId?: string;
  } | null = null;

  for (const section of config.sections) {
    for (const item of section.items) {
      if (matchesHref(pathWithoutLocale, item.href)) {
        // Keep the longest matching href (most specific)
        // For wildcard patterns, use the base path length for comparison
        const itemHrefLength = item.href.replace(/\/\*.*$/, "").length;
        const bestMatchLength = bestMatch
          ? bestMatch.href.replace(/\/\*.*$/, "").length
          : 0;

        if (!bestMatch || itemHrefLength > bestMatchLength) {
          bestMatch = { id: item.id, href: item.href };
        }
      }

      // Check children if any
      if (item.children) {
        for (const child of item.children) {
          if (matchesHref(pathWithoutLocale, child.href)) {
            const childHrefLength = child.href.replace(/\/\*.*$/, "").length;
            const bestMatchLength = bestMatch
              ? bestMatch.href.replace(/\/\*.*$/, "").length
              : 0;

            if (!bestMatch || childHrefLength > bestMatchLength) {
              // For child routes, we want to return the parent ID to highlight the parent in navigation
              bestMatch = {
                id: item.id,
                href: child.href,
                isChild: true,
                parentId: item.id,
              };
            }
          }
        }
      }
    }
  }

  return bestMatch?.id || null;
}

export function getPageTitle(pathname: string, role: ValidRole): string {
  const config = NAVIGATION_CONFIG[role];

  // Remove locale from pathname for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "");

  for (const section of config.sections) {
    for (const item of section.items) {
      if (item.href === pathWithoutLocale) {
        return item.pageTitle || item.label;
      }

      if (item.href.includes("*")) {
        const pattern = item.href
          .replace(/\/\*$/, "(?:/.*)?")
          .replace(/\*/g, ".*");
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(pathWithoutLocale)) {
          return item.pageTitle || item.label;
        }
      }

      // Check children if any
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathWithoutLocale) {
            return child.pageTitle || child.label;
          }
          if (child.href.includes("*")) {
            const pattern = child.href
              .replace(/\/\*$/, "(?:/.*)?")
              .replace(/\*/g, ".*");
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(pathWithoutLocale)) {
              return child.pageTitle || child.label;
            }
          }
        }
      }
    }
  }

  return "";
}
