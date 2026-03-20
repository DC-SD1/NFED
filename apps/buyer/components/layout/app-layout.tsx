"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  CaretDownFilled,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Logout,
  useIsMobile,
  V0SidebarProvider,
} from "@cf/ui";
import { useClerk, useSession } from "@clerk/nextjs";
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Search,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import type { Locale } from "@/config/i18n-config";
import {
  getActiveNavItem,
  getBottomNavItems,
  getPageTitle,
  shouldHideBottomNav,
} from "@/lib/config/navigation";
import { ROLES, type ValidRole } from "@/lib/schemas/auth";
import { useAuthActions, useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  locale?: Locale;
}

function Header({ locale = "en" }: { locale?: string }) {
  const { session } = useSession();
  const { signOut } = useClerk();
  const authUser = useAuthUser();
  const authActions = useAuthActions();
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Get user role
  const userRoles = authUser.roles || [];
  const primaryRole = (userRoles[0] as ValidRole) || ROLES.BUYER;

  const pageTitle = getPageTitle(pathname, primaryRole);

  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";
  const userName =
    session?.user?.firstName || userEmail.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout action from auth store
      await authActions.logout(signOut, router, locale);
    } catch (error) {
      // Fallback to direct navigation if logout fails
      router.replace(`/${locale}/sign-in`);
    }
  };

  return (
    <header className="bg-container flex h-20 items-center gap-4 px-6 backdrop-blur-sm">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-primary-light rounded-full"
        >
          <Search className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className=" bg-primary-light relative rounded-full"
        >
          <Bell className="size-5" />
          {/* TODO: Add notification count when API is ready */}
          {/* <span className="bg-destructive text-destructive-foreground absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
            2
          </span> */}
        </Button>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 rounded-full p-1">
              <Avatar className="size-9">
                <AvatarImage
                  src={session?.user?.imageUrl || "/placeholder.svg"}
                />
                <AvatarFallback className="bg-primary-darkest text-primary-lightest text-sm">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <CaretDownFilled className="text-foreground size-4 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-container w-72 rounded-2xl border-0 p-0 shadow-[0_0_20px_rgba(0,0,0,0.15)] md:w-96"
          >
            <DropdownMenuLabel className="p-3" asChild>
              <div className="flex items-center justify-between">
                <div className="flex flex-row gap-2 space-y-1">
                  <Avatar className="size-9">
                    <AvatarImage
                      src={session?.user?.imageUrl || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-primary-darkest text-primary-lightest text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {userName}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-full hover:bg-red-500"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </DropdownMenuLabel>
            {/* Subtle separator */}
            <div className="bg-border mx-4 mb-4 h-px"></div>
            <div className="px-2 pb-2">
              <DropdownMenuItem
                asChild
                className="mb-2 rounded-xl bg-white p-4"
              >
                <Link
                  href={`/${locale}/profile`}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="size-4" />
                    <span className="text-sm font-medium">
                      Profile settings
                    </span>
                  </div>
                  <ChevronRight className="size-4" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="mb-2 rounded-xl bg-white p-4"
              >
                <Link
                  href={`/${locale}/#`}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4" />
                    <span className="text-sm font-medium">
                      Account settings
                    </span>
                  </div>
                  <ChevronRight className="size-4 " />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="mb-4 rounded-xl bg-white p-4"
              >
                <Link
                  href={`/${locale}/#`}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CircleDollarSign className="size-4" />
                    <span className="text-sm font-medium">
                      Payment settings
                    </span>
                  </div>
                  <ChevronRight className="size-4 " />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="mt-20 rounded-xl bg-white p-4 hover:bg-red-50"
                onSelect={handleLogout}
              >
                <div className="flex w-full items-center gap-2">
                  <Logout className="size-4" />
                  <span className="text-sm font-medium">Logout</span>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function FloatingBottomNav({ locale = "en" }: { locale?: string }) {
  const pathname = usePathname();
  const authUser = useAuthUser();
  const userRoles = authUser.roles || [];
  const primaryRole = (userRoles[0] as ValidRole) || ROLES.BUYER;
  const bottomNavItems = getBottomNavItems(primaryRole);
  const activeNavId = getActiveNavItem(pathname, primaryRole);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 md:hidden">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl border bg-white shadow-lg">
        {bottomNavItems.map((item) => {
          const isActive = activeNavId === item.id;
          return (
            <Link
              key={item.id}
              href={`/${locale}${item.href}`}
              className={cn(
                "safe-area-inset-bottom flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-tab-bar-active-background text-tab-bar-active-text scale-105"
                  : "text-foreground hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon
                className={cn(
                  "size-5 transition-all duration-200 ease-in-out",
                  isActive ? "scale-110" : "",
                )}
              />
              <span
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  isActive ? "font-medium" : "",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AppLayout({ children, locale = "en" }: AppLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const hideBottomNav = shouldHideBottomNav(pathname);

  return (
    <V0SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f3f7f2]">
        {/* Desktop Sidebar */}
        <div className="fixed left-0 top-0 z-40 hidden md:block">
          <AppSidebar locale={locale} />
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-screen flex-1 flex-col md:ml-[104px]">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-white">
            <Suspense fallback={<div>Loading...</div>}>
              <Header locale={locale} />
            </Suspense>
          </div>

          {/* Main Content */}
          <main
            className={cn(
              "min-h-0 flex-1 bg-[#f3f7f2] px-6 py-1",
              !hideBottomNav && isMobile && "pb-24",
            )}
          >
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && !hideBottomNav && <FloatingBottomNav locale={locale} />}
      </div>
    </V0SidebarProvider>
  );
}
