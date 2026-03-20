import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "../utils/cn";

export interface BottomNavigationProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BottomNavigationItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
  badge?: number | string;
  className?: string;
}

const BottomNavigation = React.forwardRef<
  HTMLDivElement,
  BottomNavigationProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 z-50 w-full h-16 border-t",
        "safe-bottom", // For iOS safe area
        className,
      )}
      {...props}
    >
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {children}
      </div>
    </div>
  );
});
BottomNavigation.displayName = "BottomNavigation";

const BottomNavigationItem = React.forwardRef<
  HTMLAnchorElement,
  BottomNavigationItemProps
>(({ label, icon: Icon, href, isActive, badge, className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
        isActive ? "text-primary" : "text-gray-500 dark:text-gray-400",
        className,
      )}
      {...props}
    >
      <div
        className={cn("relative p-3 rounded-full", isActive && "bg-primary/10")}
      >
        <Icon className="w-6 h-6" />
        {badge !== undefined && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  );
});
BottomNavigationItem.displayName = "BottomNavigationItem";

export { BottomNavigation, BottomNavigationItem };
