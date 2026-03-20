"use client";

import { Button, cn } from "@cf/ui";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import React from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

interface MainProps {
  children: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  mainClassName?: string;
}

interface HeaderProps {
  title: string;
  onBackClick?: () => void;
}

interface FooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * @name AppReviewLayout
 * @description Compound layout with Header, Main, and Side sections.
 * @example
 * <AppReviewLayout>
 *   <AppReviewLayout.Header>Header Content</AppReviewLayout.Header>
 *   <AppReviewLayout.Main>Main Content</AppReviewLayout.Main>
 *   <AppReviewLayout.Footer>Footer Content</AppReviewLayout.Footer>
 * </AppReviewLayout>
 */
const AppReviewLayout = ({ children, className }: LayoutProps) => {
  return (
    <div className={cn("flex w-full flex-col", className)}>{children}</div>
  );
};

// Sub-components
const Header = ({ title, onBackClick }: HeaderProps) => {
  const router = useRouter();

  const handleRouteBack = () => {
    onBackClick?.();
    router.back();
  };

  return (
    <header className="flex items-center justify-between gap-2 border-b border-[#E5E8DF] px-5 py-4">
      <div className="flex items-center gap-4">
        <Button
          tabIndex={-1}
          variant={"ghost"}
          size={"sm"}
          onClick={handleRouteBack}
          aria-label="Close"
          className={"hover:text-foreground hover:bg-transparent"}
        >
          <X className={"size-6"} />
        </Button>
        <div className={"h-6 border-r"} />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div></div>
    </header>
  );
};

const Main = ({
  children,
  leftContent,
  rightContent,
  className,
  mainClassName,
}: MainProps) => {
  return (
    <main className={cn("size-full", className)}>
      {leftContent}
      <div className={mainClassName}>{children}</div>
      {rightContent}
    </main>
  );
};

const Footer = ({ children, className }: FooterProps) => {
  return <footer className={cn("flex", className)}>{children}</footer>;
};

// Attach as static properties
AppReviewLayout.Header = Header;
AppReviewLayout.Main = Main;
AppReviewLayout.Footer = Footer;

export default AppReviewLayout;
