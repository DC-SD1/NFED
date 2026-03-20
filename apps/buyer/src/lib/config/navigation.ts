import { Dashboard, FarmLands, FarmManagerTab, User, Users } from "@cf/ui";
import type { Icon } from "@cf/ui/icons";
import type { LucideIcon } from "lucide-react";
import { Settings, TreePine, UserPlus } from "lucide-react";

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

export interface RoleNavigationConfig {
  sections: NavigationSection[];
  bottomNavItems?: string[]; // IDs of items to show in bottom nav
  defaultPath: string;
}

/**
 * Role-based navigation configuration
 * Each role has its own navigation structure
 */
export const NAVIGATION_CONFIG: Record<ValidRole, RoleNavigationConfig> = {
  [ROLES.BUYER]: {
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
          },
          {
            id: "farm-managers",
            label: "Farm Mgr",
            pageTitle: "Farm manager",
            href: "/farm-owner/farm-managers",
            icon: FarmManagerTab,
            showInBottomNav: true,
          },
        ],
        showInSidebar: true,
        showInBottomNav: true,
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
    ],
    bottomNavItems: ["dashboard", "farm-lands", "farm-managers"],
    defaultPath: "/farm-owner",
  },
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
          },
          {
            id: "farm-managers",
            label: "Farm Mgr",
            pageTitle: "Farm manager",
            href: "/farm-owner/farm-managers",
            icon: FarmManagerTab,
            showInBottomNav: true,
          },
        ],
        showInSidebar: true,
        showInBottomNav: true,
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
    ],
    bottomNavItems: ["dashboard", "farm-lands", "farm-managers"],
    defaultPath: "/farm-owner",
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
export function shouldHideBottomNav(pathname: string): boolean {
  const pathsWithoutBottomNav = [
    "/invite-farm-manager",
    "/onboarding",
    "/settings",
    "/profile",
  ];

  return pathsWithoutBottomNav.some((path) => pathname.includes(path));
}

/**
 * Get the active navigation item based on current path
 *
 * This function determines which navigation item should be shown as active based on the current URL.
 * It first checks if the current path has a parent mapping (for contextual navigation),
 * then falls back to finding the best matching navigation item by prefix.
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
  let bestMatch: { id: string; href: string } | null = null;

  for (const section of config.sections) {
    for (const item of section.items) {
      if (pathWithoutLocale.startsWith(item.href)) {
        // Keep the longest matching href (most specific)
        if (!bestMatch || item.href.length > bestMatch.href.length) {
          bestMatch = { id: item.id, href: item.href };
        }
      }

      // Check children if any
      if (item.children) {
        for (const child of item.children) {
          if (pathWithoutLocale.startsWith(child.href)) {
            if (!bestMatch || child.href.length > bestMatch.href.length) {
              bestMatch = { id: child.id, href: child.href };
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

      // Check children if any
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathWithoutLocale) {
            return child.pageTitle || child.label;
          }
        }
      }
    }
  }

  return "";
}
