"use client";

import { Button, cn } from "@cf/ui";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  contentClassName?: string; // Defaults to w-full
  bodyClassName?: string;
}

export default function AppSheetModal({
  open,
  onClose,
  title,
  children,
  contentClassName = "max-w-lg",
  bodyClassName,
}: Props) {
  const panelRef = useRef<any>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on backdrop click (ignore clicks inside panel)
  const onBackdropClick = () => {
    onClose();
  };
  return (
    <div
      aria-hidden={!open}
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop with blur + dim */}
      <div
        onClick={onBackdropClick}
        onKeyDown={(e) => e.key === "Enter" && onBackdropClick()}
        tabIndex={0}
        role="button"
        aria-label="Close modal"
        className={`absolute inset-0 transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0"}
          cursor-auto bg-[#171F1766] backdrop-blur-sm`}
      />

      {/* Sheet panel */}
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-screen w-full ${contentClassName}
          bg-white shadow-xl transition-transform
          duration-300 will-change-transform dark:bg-neutral-900
          ${open ? "translate-x-0" : "translate-x-full"}
          flex flex-col`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E8DF] p-3">
          <div className="flex items-center gap-4">
            <Button
              tabIndex={-1}
              variant={"ghost"}
              size={"sm"}
              onClick={onClose}
              aria-label="Close"
              className={"hover:text-foreground hover:bg-transparent"}
            >
              <X className={"size-6"} />
            </Button>
            <div className={"h-6 border-r"} />
          </div>
          <h2 className="text-lg font-semibold">{title ?? "Modal"}</h2>
          <div></div>
        </div>
        <div className={cn("flex-1 overflow-auto px-8 py-6", bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
