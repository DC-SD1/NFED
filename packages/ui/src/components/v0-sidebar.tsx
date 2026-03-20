"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import * as React from "react";

import { cn } from "../utils/cn";
import { Button } from "./button";
import { SquareChevronLeft } from "./icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const sidebarVariants = cva(
  "flex flex-col bg-container text-sidebar-foreground transition-all duration-300 ease-in-out h-full",
  {
    variants: {
      variant: {
        default: "",
        inset: "m-4 rounded-2xl", // Removed border and shadow
      },
      collapsed: {
        true: "w-[80px]",
        false: "w-[104px]",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
    },
  },
);

interface V0SidebarContextProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const V0SidebarContext = React.createContext<V0SidebarContextProps | undefined>(
  undefined,
);

const useV0Sidebar = () => {
  const context = React.useContext(V0SidebarContext);
  if (!context) {
    throw new Error("useV0Sidebar must be used within a SidebarProvider");
  }
  return context;
};

const V0SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <V0SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <TooltipProvider>{children}</TooltipProvider>
    </V0SidebarContext.Provider>
  );
};

interface V0SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const V0Sidebar = React.forwardRef<HTMLDivElement, V0SidebarProps>(
  ({ className, variant, ...props }, ref) => {
    const { isCollapsed } = useV0Sidebar();

    return (
      <div
        ref={ref}
        className={cn(
          "hidden md:flex",
          sidebarVariants({ collapsed: isCollapsed, variant }),
          className,
        )}
        {...props}
      />
    );
  },
);
V0Sidebar.displayName = "V0Sidebar";

const V0SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center h-20 p-4", className)}
      {...props}
    />
  );
});
V0SidebarHeader.displayName = "V0SidebarHeader";

const V0SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1", className)} {...props} />;
});
V0SidebarContent.displayName = "V0SidebarContent";

const V0SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("p-4 mt-auto", className)} {...props} />;
});
V0SidebarFooter.displayName = "V0SidebarFooter";

const V0SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  return (
    <nav
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
});
V0SidebarNav.displayName = "V0SidebarNav";

const V0SidebarNavItem = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    href: string;
  }
>(({ className, icon, label, isActive, href, ...props }, ref) => {
  const { isCollapsed } = useV0Sidebar();

  const itemContent = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-colors min-h-[70px]",
        isActive
          ? "bg-tab-bar-active-background text-foreground"
          : "bg-primary-light text-[#71786C]  hover:bg-sidebar-accent/50",
      )}
    >
      {icon}
      {!isCollapsed && (
        <span className="text-xs font-medium text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  );

  const linkComponent = (
    <Link href={href} ref={ref} className={cn("block", className)} {...props}>
      {itemContent}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkComponent}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkComponent;
});
V0SidebarNavItem.displayName = "V0SidebarNavItem";

interface V0SidebarNavItemWithChildrenProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href: string;
  children?: {
    id: string;
    label: string;
    href: string;
  }[];
  activeChildId?: string | null;
  locale?: string;
  className?: string;
}

const V0SidebarNavItemWithChildren = React.forwardRef<
  HTMLDivElement,
  V0SidebarNavItemWithChildrenProps
>(
  (
    {
      className,
      icon,
      label,
      isActive,
      href,
      children,
      activeChildId,
      locale = "en",
    },
    ref,
  ) => {
    const { isCollapsed } = useV0Sidebar();
    const [isHovered, setIsHovered] = React.useState(false);

    const itemContent = (
      <div
        className={cn(
          "flex flex-col rounded-2xl transition-colors overflow-hidden",
          isActive ?? isHovered
            ? "bg-tab-bar-active-background text-foreground"
            : "bg-primary-light text-[#71786C]",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main item - clickable */}
        <Link
          href={`/${locale}${href}`}
          className="flex flex-col items-center justify-center gap-1 p-3 pt-4 pb-2"
        >
          {icon}
          {!isCollapsed && (
            <span className="text-xs font-medium text-center leading-tight">
              {label}
            </span>
          )}
        </Link>

        {/* Sub-items - only show when hovered and not collapsed */}
        {isHovered && !isCollapsed && children && children.length > 0 && (
          <div className="flex flex-col  pb-3 pt-2 px-1 gap-1 border-t border-[#B2F3A0]">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}${child.href}`}
                className={cn(
                  "px-1 py-1.5 text-[11px] text-left rounded-md transition-colors mt-3  ",
                  activeChildId === child.id
                    ? "text-foreground font-semibold"
                    : "text-foreground/70 hover:text-foreground hover:bg-[#B2F3A0]",
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );

    if (isCollapsed) {
      return (
        <div ref={ref} className={cn("block", className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/${locale}${href}`} className="block">
                <div className="flex flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-colors min-h-[70px] bg-primary-light text-[#71786C] hover:bg-sidebar-accent/50">
                  {icon}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("block", className)}>
        {itemContent}
      </div>
    );
  },
);
V0SidebarNavItemWithChildren.displayName = "V0SidebarNavItemWithChildren";

const V0SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed, setIsCollapsed } = useV0Sidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("rounded-lg", className)}
      onClick={() => setIsCollapsed(!isCollapsed)}
      {...props}
    >
      <SquareChevronLeft
        className={cn(
          "size-5 transition-transform",
          isCollapsed && "rotate-180",
        )}
      />
    </Button>
  );
});
V0SidebarToggle.displayName = "V0SidebarToggle";

export {
  useV0Sidebar,
  V0Sidebar,
  V0SidebarContent,
  V0SidebarFooter,
  V0SidebarHeader,
  V0SidebarNav,
  V0SidebarNavItem,
  V0SidebarNavItemWithChildren,
  V0SidebarProvider,
  V0SidebarToggle,
};
