"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@cf/ui/components/avatar";
import { Button } from "@cf/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@cf/ui/components/dropdown-menu";
import { useAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/logo";
import { useUser } from "@/lib/hooks/use-user";
import { ROLES } from "@/lib/schemas/auth";
import { useAuthActions } from "@/lib/stores/auth-store-ssr";

import { RoleIndicator } from "./role-indicator";

export function DashboardHeader() {
  const t = useTranslations("dashboard");
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { signOut } = useAuth();
  const { logout } = useAuthActions();
  const { user: clerkUser } = useClerkUser();
  const {
    roles: _roles,
    isPrimaryRole,
    isAuthenticated: _isAuthenticated,
  } = useUser();

  const handleLogout = async () => {
    await logout(signOut, router, locale);
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="size-8">
            <Logo />
          </div>
          <nav className="hidden space-x-6 md:flex">
            {/* Common dashboard link */}
            <Link
              href={
                isPrimaryRole(ROLES.FARM_OWNER)
                  ? `/${locale}/farm-owner`
                  : isPrimaryRole(ROLES.AGENT)
                    ? `/${locale}/agent`
                    : `/${locale}/dashboard`
              }
              className="hover:text-primary text-sm font-medium transition-colors"
            >
              {t("nav.dashboard")}
            </Link>

            {/* Farmer-specific navigation */}
            {isPrimaryRole(ROLES.FARM_OWNER) && (
              <>
                <Link
                  href={`#`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.farmer.farms")}
                </Link>
                <Link
                  href={`#`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.farmer.crops")}
                </Link>
                <Link
                  href={`#`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.farmer.activities")}
                </Link>
                <Link
                  href={`#`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.farmer.analytics")}
                </Link>
              </>
            )}

            {/* Agent-specific navigation */}
            {isPrimaryRole("Agent") && (
              <>
                <Link
                  href={`/${locale}/agent/clients`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.agent.clients")}
                </Link>
                <Link
                  href={`/${locale}/agent/territory`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.agent.territory")}
                </Link>
                <Link
                  href={`/${locale}/agent/performance`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.agent.performance")}
                </Link>
                <Link
                  href={`/${locale}/agent/reports`}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
                >
                  {t("nav.agent.reports")}
                </Link>
              </>
            )}

            {/* Common profile link */}
            <Link
              href={`/${locale}/profile`}
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              {t("nav.profile")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <RoleIndicator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage
                    src={clerkUser?.imageUrl}
                    alt={clerkUser?.firstName || ""}
                  />
                  <AvatarFallback>
                    {clerkUser?.firstName?.[0]}
                    {clerkUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {clerkUser?.firstName} {clerkUser?.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {clerkUser?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/profile`} className="cursor-pointer">
                  <User className="mr-2 size-4" />
                  <span>{t("nav.profile")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
