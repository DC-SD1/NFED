import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cf/ui";
import React from "react";

interface ActionDialogConfig {
  header: { title: string; description?: string };
  form: { cancelLabel: string; confirmLabel: string };
  styles?: {
    contentClassName?: string;
    closeClassName?: string;
    confirmButtonClassName?: string;
    cancelButtonClassName?: string;
  };
}

interface ActionDialogPropsLegacy {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  contentClassName?: string;
  closeClassName?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

interface ActionDialogProps extends Partial<ActionDialogPropsLegacy> {
  trigger: React.ReactElement;
  onConfirm: () => void;
  isPending?: boolean;
  isConfirmDisabled?: boolean;
  config?: ActionDialogConfig;
  children?: React.ReactNode;
}

export default function ActionDialog({
  trigger,
  onConfirm,
  isPending = false,
  isConfirmDisabled = false,
  config,
  // legacy fallbacks
  title,
  description,
  confirmLabel,
  cancelLabel,
  contentClassName,
  closeClassName,
  confirmButtonClassName,
  cancelButtonClassName,
  children,
}: ActionDialogProps) {
  const resolved = React.useMemo(() => {
    if (config) {
      return {
        header: {
          title: config.header.title,
          description: config.header.description,
        },
        form: {
          cancelLabel: config.form.cancelLabel,
          confirmLabel: config.form.confirmLabel,
        },
        styles: {
          contentClassName:
            config.styles?.contentClassName ?? "sm:max-w-[440px]",
          closeClassName:
            config.styles?.closeClassName ?? "p-2 !rounded-full bg-[#F5F5F5]",
          confirmButtonClassName:
            config.styles?.confirmButtonClassName ??
            "h-[56px] w-1/2 rounded-xl font-bold",
          cancelButtonClassName:
            config.styles?.cancelButtonClassName ??
            "h-[56px] w-1/2 rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]",
        },
      };
    }
    return {
      header: { title: title ?? "", description },
      form: {
        cancelLabel: cancelLabel ?? "Cancel",
        confirmLabel: confirmLabel ?? "Confirm",
      },
      styles: {
        contentClassName: contentClassName ?? "sm=max-w-[440px]",
        closeClassName: closeClassName ?? "p-2 !rounded-full bg-[#F5F5F5]",
        confirmButtonClassName:
          confirmButtonClassName ?? "h-[56px] w-1/2 rounded-xl font-bold",
        cancelButtonClassName:
          cancelButtonClassName ??
          "h-[56px] w-1/2 rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]",
      },
    };
  }, [
    config,
    title,
    description,
    confirmLabel,
    cancelLabel,
    contentClassName,
    closeClassName,
    confirmButtonClassName,
    cancelButtonClassName,
  ]);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={resolved.styles.contentClassName}
        closeClassName={resolved.styles.closeClassName}
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="!not-sr-only text-center text-xl">
            {resolved.header.title}
          </DialogTitle>
          {resolved.header.description ? (
            <DialogDescription className="text-center">
              {resolved.header.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        <DialogFooter className="flex flex-row justify-between gap-x-6">
          <DialogClose asChild>
            <Button
              disabled={isPending}
              aria-disabled={isPending}
              size="lg"
              variant="outline"
              className={resolved.styles.cancelButtonClassName}
            >
              {resolved.form.cancelLabel}
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              loading={isPending}
              disabled={isConfirmDisabled || isPending}
              aria-disabled={isConfirmDisabled || isPending}
              size="lg"
              className={resolved.styles.confirmButtonClassName}
              onClick={onConfirm}
            >
              {resolved.form.confirmLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
