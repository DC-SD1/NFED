import { Dashboard } from "@cf/ui";
import {
  IconBuildingWarehouse,
  IconChecklist,
  IconUsersGroup,
  IconWallet,
} from "@tabler/icons-react";
import { Users } from "lucide-react";

export interface SideBarItem {
  id: string;
  title: string;
  url: string;
  icon: React.ElementType;
  items?: {
    title: string;
    url: string;
  }[];
}

/**
 * Extract the path after the locale prefix (e.g., removes /en/ from /en/dashboard)
 * @param {string} fullPath - The full pathname including locale
 * @returns {string} - Path without locale prefix
 */
export const getPathWithoutLocale = (fullPath: string): string => {
  const segments = fullPath.split("/").filter(Boolean);
  return segments.slice(1).join("/"); // Remove first segment (locale)
};

/**
 * Check if a menu item URL is active based on current pathname
 * @param {string} url - The menu item URL to check
 * @param {string} currentPath - The current path without locale
 * @returns {boolean} - Whether the URL is active
 */
export const isActive = (url: string, currentPath: string): boolean => {
  if (url === "#") return false;

  const cleanUrl = url.replace(/^\//, "");
  return currentPath === cleanUrl || currentPath.startsWith(cleanUrl + "/");
};

/**
 * Check if any submenu item is active (for dropdown expansion)
 * @param {SideBarItem} item - The sidebar item to check
 * @param {string} currentPath - The current path without locale
 * @returns {boolean} - Whether any submenu item is active
 */
export const hasActiveSubmenu = (
  item: SideBarItem,
  currentPath: string,
): boolean => {
  if (!item.items || item.items.length === 0) return false;

  return item.items.some((subItem) => isActive(subItem.url, currentPath));
};

/**
 * Check if a sidebar item should be expanded (active itself or has active submenu)
 * @param {SideBarItem} item - The sidebar item to check
 * @param {string} currentPath - The current path without locale
 * @returns {boolean} - Whether the item should be expanded
 */
export const shouldExpand = (
  item: SideBarItem,
  currentPath: string,
): boolean => {
  // If the main item is active (but not #), expand
  if (isActive(item.url, currentPath)) return true;

  // If any submenu item is active, expand
  return hasActiveSubmenu(item, currentPath);
};

/**
 * Get current path without locale and create navigation helper functions
 * @param {string} pathname - The full pathname from usePathname()
 * @returns {object} - Object containing currentPath and helper functions
 */
export const useActiveNavigation = (
  pathname: string,
): {
  currentPath: string;
  isActive: (url: string) => boolean;
  hasActiveSubmenu: (item: SideBarItem) => boolean;
  shouldExpand: (item: SideBarItem) => boolean;
} => {
  const currentPath = getPathWithoutLocale(pathname);

  const checkIsActive = (url: string) => isActive(url, currentPath);

  const checkHasActiveSubmenu = (item: SideBarItem) =>
    hasActiveSubmenu(item, currentPath);

  const checkShouldExpand = (item: SideBarItem) =>
    shouldExpand(item, currentPath);

  return {
    currentPath,
    isActive: checkIsActive,
    hasActiveSubmenu: checkHasActiveSubmenu,
    shouldExpand: checkShouldExpand,
  };
};

export const SIDE_BAR_MENU: SideBarItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/dashboard",
    icon: Dashboard,
  },
  {
    id: "user-management",
    title: "User management",
    url: "/user-management",
    icon: Users,
  },
  {
    id: "customer-management",
    title: "Customer management",
    url: "#",
    icon: IconUsersGroup,
    items: [
      {
        title: "Formal growers",
        url: "/formal-growers",
      },
      {
        title: "Agents",
        url: "/agents",
      },
      {
        title: "Buyers",
        url: "/buyers",
      },
      {
        title: "Smallholder farmers",
        url: "#",
      },
    ],
  },
  {
    id: "fulfilment-centers",
    title: "Fulfilment centers",
    url: "/fulfilment-centers",
    icon: IconBuildingWarehouse,
  },
  {
    id: "wallets",
    title: "Wallets",
    url: "#",
    icon: IconWallet,
    items: [
      {
        title: "Finance admin wallet",
        url: "/wallets/finance-admin-wallet",
      },
      {
        title: "Fulfilment center wallets",
        url: "/wallets/fulfilment-center-wallets",
      },
      {
        title: "Funding requests",
        url: "#",
      },
      {
        title: "Payment",
        url: "#",
      },
      {
        title: "Agents wallets",
        url: "#",
      },
      {
        title: "Growers wallets",
        url: "#",
      },
    ],
  },
  {
    id: "all-payments",
    title: "All Payments",
    url: "#",
    icon: IconWallet,
    items: [
      {
        title: "Buyer order payments",
        url: "/payments",
      },
      {
        title: "Payouts",
        url: "/payouts",
      },
    ],
  },
  {
    id: "all-requests",
    title: "All requests",
    url: "/all-requests/new",
    icon: IconChecklist,
  },
];
