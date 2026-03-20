"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  cn,
  useIsMobile,
  useSidebar,
} from "@cf/ui";
import { IconArrowBarLeft, IconArrowBarRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import React from "react";

import StatusBadge from "@/components/common/status-badge";
import type { Tab } from "@/components/tabs/app-tabs";
import AppTabs from "@/components/tabs/app-tabs";
import useLayoutStore from "@/lib/stores/layout/layout-store";
import { getLeftMargin } from "@/utils/helpers/common-helpers";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

interface MainProps {
  tabs: Tab[];
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
  tabClassName?: string;
  tabContentClassName?: string;
  tabTriggerClassName?: string;
  hasAlertBanner?: boolean;
}

interface HeaderProps {
  children?: ReactNode;
  className?: string;
  title: string;
  toolBar?: React.ReactNode;
  breadcrumbList: {
    label: string;
    href?: string;
    isBackUrl?: boolean;
  }[];
  status: string;
  alertBanner?: React.ReactNode;
}

interface SideProps {
  children: ReactNode;
  className?: string;
  hasAlertBanner?: boolean;
}

/**
 * @name AppDetailLayout
 * @description Compound layout with Header, Main, and Side sections.
 * @example
 * <AppDetailLayout>
 *   <AppDetailLayout.Header>Header Content</AppDetailLayout.Header>
 *   <AppDetailLayout.Main>Main Content</AppDetailLayout.Main>
 *   <AppDetailLayout.Side>Sidebar Content</AppDetailLayout.Side>
 * </AppDetailLayout>
 */
const AppDetailLayout = ({ children, className }: LayoutProps) => {
  const { state, isMobile: isToggleModal } = useSidebar();
  const leftMargin = getLeftMargin(isToggleModal, state);

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      <div
        className={cn(
          "fixed inset-x-0 top-16 z-10 flex flex-col bg-white transition-all duration-200 ease-linear",
          className,
        )}
        style={{ left: leftMargin }}
      >
        {children}
      </div>
    </div>
  );
};

// Sub-components
const Header = ({
  children,
  className,
  breadcrumbList,
  status,
  alertBanner,
  toolBar,
  title,
}: HeaderProps) => {
  const router = useRouter();

  const handleRouteBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.back();
  };

  return (
    <header
      className={cn("flex flex-col gap-4 border-b px-10 py-4", className)}
    >
      {alertBanner}
      <div
        className={
          "flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        }
      >
        <div className={"flex flex-col gap-2"}>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbList.map((item, index) => (
                <React.Fragment key={item.href || item.label}>
                  <BreadcrumbItem>
                    {index === breadcrumbList.length - 1 ? (
                      <BreadcrumbPage className={"text-foreground"}>
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className={"font-bold !text-[#36B92E]"}
                        href={item.href || "#"}
                        onClick={item.isBackUrl ? handleRouteBack : undefined}
                      >
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbList.length - 1 && (
                    <BreadcrumbSeparator
                      className={"text-secondary-foreground"}
                    />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className={"flex items-center gap-1"}>
            <h1 className={"text-2xl font-bold"}>{title}</h1>
            <StatusBadge status={status} isBold={true} />
          </div>
        </div>
        {toolBar}
      </div>
      {children}
    </header>
  );
};

const Main = ({
  children,
  className,
  hasAlertBanner,
  defaultValue,
  tabs,
  tabClassName,
  tabContentClassName,
  tabTriggerClassName,
}: MainProps) => {
  const rightSidebarOpen = useLayoutStore.use.rightSidebarOpen();
  const isMobile = useIsMobile(1024);
  const { state } = useSidebar();

  return (
    <main>
      <div className={cn("relative flex w-full flex-1 flex-col", className)}>
        <AppTabs
          tabs={tabs}
          tabClassName={cn(
            "h-[90vh] overflow-auto pb-20 transition-all duration-300 md:pb-8",
            rightSidebarOpen ? (isMobile ? "mr-40" : "mr-[394px]") : "mr-10",
          )}
          className={cn(
            "fixed z-10",
            state === "collapsed" && "pl-3",
            tabClassName,
          )}
          defaultValue={defaultValue}
          contentClassName={cn(
            "px-8 pb-24 pt-16",
            state === "collapsed" && "pl-10",
            hasAlertBanner && "pb-40",
            tabContentClassName,
          )}
          triggerClassName={cn(tabTriggerClassName)}
        >
          {children}
        </AppTabs>
      </div>
    </main>
  );
};

const Side = ({ children, className, hasAlertBanner }: SideProps) => {
  const { rightSidebarOpen, setRightSidebarOpen } = useLayoutStore();
  const isSmall = useIsMobile(640);

  return (
    <div className={cn("relative", className)}>
      <div
        className="bg-border fixed bottom-0 z-30 w-px border-l transition-all duration-200 ease-linear"
        style={{
          top: isSmall
            ? hasAlertBanner
              ? "20.2rem"
              : "16.2rem"
            : cn(hasAlertBanner ? "calc(4rem + 155px)" : "calc(4rem + 92px)"), // Navbar height + title section height
          right: rightSidebarOpen ? "394px" : "40px",
        }}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        className="bg-background hover:bg-background focus:bg-background fixed z-30 size-8 p-0 transition-all duration-200 ease-linear"
        style={{
          top: isSmall
            ? cn(hasAlertBanner ? "20.5rem" : "13.6rem")
            : hasAlertBanner
              ? "14rem"
              : "calc(4rem + 100px)",
          right: rightSidebarOpen ? "360px" : "0.5rem",
        }}
      >
        {rightSidebarOpen ? (
          <IconArrowBarRight className="size-6 text-[#161D14]" />
        ) : (
          <IconArrowBarLeft className="size-6 text-[#161D14]" />
        )}
      </Button>

      {/* Sidebar Content - slides in/out */}
      <div
        className={cn(
          "fixed bottom-0 right-0 z-10 w-[24.7rem] bg-white transition-all duration-200 ease-linear",
          rightSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{
          top: isSmall
            ? hasAlertBanner
              ? "22.5rem"
              : "16.2rem"
            : cn(hasAlertBanner ? "calc(4rem + 190px)" : "calc(4rem + 135px)"),
        }}
      >
        {!rightSidebarOpen && (
          <div
            className={cn(
              "absolute -top-1 right-[394px] z-10 h-5 w-10 bg-white",
            )}
          />
        )}
        <div className="h-full overflow-auto px-6 py-2">{children}</div>
      </div>
    </div>
  );
};

// Attach as static properties
AppDetailLayout.Header = Header;
AppDetailLayout.Main = Main;
AppDetailLayout.Side = Side;

export default AppDetailLayout;
