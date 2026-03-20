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
  Form,
  Label,
  Textarea,
} from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

interface ReasonDialogConfig {
  header: { title: string; description?: string };
  form: { label: string; placeholder?: string; minLength: number };
  actions: { cancel: string; confirm: string };
  styles?: {
    contentClassName?: string;
    closeClassName?: string;
    textareaClassName?: string;
    cancelButtonClassName?: string;
    confirmButtonClassName?: string;
  };
}

interface ReasonDialogProps {
  trigger: React.ReactElement;
  config: ReasonDialogConfig;
  isPending?: boolean;
  onSubmit: (values: { reason: string }) => void;
}

export default function ReasonDialog({
  trigger,
  config,
  isPending = false,
  onSubmit,
}: ReasonDialogProps) {
  const { header, form: formCfg, actions, styles } = config;

  const contentClassName = styles?.contentClassName ?? "sm:max-w-[440px]";
  const closeClassName =
    styles?.closeClassName ?? "p-2 !rounded-full bg-[#F5F5F5]";
  const textareaClassName =
    styles?.textareaClassName ??
    "placeholder:text-placeholder-text bg-primary-light text-foreground resize-none rounded border border-[hsl(var(--border-light))] text-sm focus-visible:ring-1";
  const cancelButtonClassName =
    styles?.cancelButtonClassName ??
    "h-[56px] w-1/2 rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]";
  const confirmButtonClassName =
    styles?.confirmButtonClassName ?? "h-[56px] w-1/2 rounded-xl font-bold";

  const formSchema = React.useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(formCfg.minLength, {
            message: `Please enter at least ${formCfg.minLength} characters`,
          }),
      }),
    [formCfg.minLength],
  );
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: "" },
    mode: "onChange",
  });

  const watchedReason = form.watch("reason");
  const isConfirmDisabled =
    isPending ||
    !watchedReason ||
    watchedReason.trim().length < formCfg.minLength;

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit({ reason: data.reason });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={contentClassName}
        closeClassName={closeClassName}
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="!not-sr-only text-center text-xl">
            {header.title}
          </DialogTitle>
          {header.description ? (
            <DialogDescription className="text-center">
              {header.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mb-6 block space-y-5"
          >
            <div className="space-y-1">
              <Label htmlFor="reason" className="font-bold">
                {formCfg.label}
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder={formCfg.placeholder}
                aria-invalid={!!form.formState.errors.reason}
                className={`${textareaClassName} ${form.formState.errors.reason ? "border-[hsl(var(--error))]" : ""}`}
                {...form.register("reason")}
              />
              {form.formState.errors.reason?.message ? (
                <p className="text-sm text-[hsl(var(--error))]">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>
          </form>
        </Form>

        <DialogFooter className="flex flex-row justify-between gap-x-6">
          <DialogClose asChild>
            <Button
              disabled={isPending}
              aria-disabled={isPending}
              size="lg"
              variant="outline"
              className={cancelButtonClassName}
            >
              {actions.cancel}
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              loading={isPending}
              disabled={isConfirmDisabled}
              aria-disabled={isConfirmDisabled}
              size="lg"
              className={confirmButtonClassName}
              onClick={form.handleSubmit(handleSubmit)}
            >
              {actions.confirm}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
