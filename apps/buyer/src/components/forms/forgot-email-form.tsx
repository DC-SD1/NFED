"use client";

import { Button } from "@cf/ui/components/button";
import { Form, FormInput } from "@cf/ui/components/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const forgotEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotEmailFormData = z.infer<typeof forgotEmailSchema>;

interface ForgotEmailFormProps {
  onSubmit: (email: string) => Promise<void>;
  userNotFound?: boolean;
}

export function ForgotEmailForm({
  onSubmit,
  userNotFound,
}: ForgotEmailFormProps) {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotEmailFormData>({
    resolver: zodResolver(forgotEmailSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const { handleSubmit, formState } = form;
  const { isValid } = formState;

  const handleFormSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      await onSubmit(data.email);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Form {...form}>
      <FormProvider {...form}>
        <div className="w-full space-y-6">
          <FormInput
            name="email"
            type="email"
            label={t("email")}
            placeholder={t("enterEmail")}
            autoComplete="email"
          />

          {userNotFound && (
            <div className="flex items-center gap-3">
              <p className="text-start text-base text-[#161D1D]">
                {t("noUserFound")}
              </p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm text-[#4B908B] hover:text-[#4B908B]/90"
                asChild
              >
                <Link href="/sign-up">{t("createAccount")}</Link>
              </Button>
            </div>
          )}

          <Button
            type="submit"
            onClick={handleFormSubmit}
            disabled={!isValid || isLoading}
            className="bg-primary h-14 w-full rounded-xl text-base font-medium text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("send_reset_link")
            )}
          </Button>
        </div>
      </FormProvider>
    </Form>
  );
}
