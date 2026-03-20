"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { useSession } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEdit } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input";

import PrimaryButton from "@/components/buttons/primary-button";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useApiClient } from "@/lib/api";
import { useAvatarUpdate } from "@/lib/hooks/use-avatar-update";
import {
  type EditProfileData,
  EditProfileSchema,
} from "@/lib/schemas/profile-schema";
import { useAuthUser } from "@/lib/stores/auth/auth-store-ssr";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import {
  getCountryFromPhone,
  getUserInitials,
} from "@/utils/helpers/common-helpers";
import { getImageTypeFromBuffer } from "@/utils/helpers/file-helper";

const EditAccountDialog = () => {
  const { isOpen, type, onClose, data, onOpen } = useModal();
  const t = useTranslations("userManagement.editAccount");
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "EditAccount";
  const { session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = data;
  const { updateAvatar, isUploading, uploadError } = useAvatarUpdate();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const authUser = useAuthUser();
  const phoneNumber =
    !user?.phoneNumber || user?.phoneNumber === "0"
      ? ""
      : user?.phoneNumber ?? "";

  const [currentCountry, setCurrentCountry] = useState<Country>(
    getCountryFromPhone(phoneNumber),
  );

  const form = useForm<EditProfileData>({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      phone: "",
    },
  });

  const { handleSubmit, control, setValue, formState } = form;

  useEffect(() => {
    setValue("phone", phoneNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutate, isPending } = api.useMutation(
    "put",
    "/admin/users/{UserId}/phone-number",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/admin/users/{UserId}",
            {
              params: {
                path: { UserId: authUser?.userId },
              },
            },
          ],
        });

        showSuccessToast(t("successMessage"));
        onClose();
        onOpen("UserProfile");
      },
      onError: (error: any) => {
        const errorMessage = error?.errors
          ?.map((err: any) => err.message)
          .join(", ");
        showErrorToast(errorMessage ?? tt("unknown_error"));
      },
    },
  );

  if (!isModalOpen) return null;

  const fullName = `${user?.firstName} ${user?.lastName}`;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!uploadError) {
        if ((await getImageTypeFromBuffer(file)) === "unknown") {
          showErrorToast("The uploaded file type is unsupported");
          return;
        }
        await updateAvatar(file);
      } else {
        showErrorToast(uploadError);
      }
    }
  };

  const handleFormSubmit = (data: EditProfileData) => {
    mutate({
      params: {
        path: { UserId: authUser?.userId ?? "" },
      },
      body: {
        newPhoneNumber: data.phone,
      },
    });
  };

  return (
    <AppDialog
      key={"edit-account-dialog"}
      isOpen={isOpen}
      size={"small"}
      title={t("title")}
      closeOnBackground={false}
      onOpenChange={(_) => {
        onClose();
      }}
      content={
        <AppDialogContent className={"flex flex-col gap-10 pb-4"}>
          <div className={"relative flex justify-center"}>
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <Avatar
              width={"w-32"}
              height={"h-32"}
              className={"text-xl font-bold text-white"}
            >
              <AvatarImage
                src={session?.user?.imageUrl || "/placeholder.svg"}
              />
              <AvatarFallback
                width={"w-32"}
                height={"h-32"}
                className="bg-[#FEF0D8] text-2xl text-[#995917]"
              >
                {getUserInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <PrimaryButton
              size={"sm"}
              variant={"outline"}
              className={"text-primary absolute -bottom-4"}
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              buttonContent={
                <>
                  {!isUploading && <IconEdit className={"size-4"} />}{" "}
                  {t("edit")}
                </>
              }
            />
          </div>

          <div>
            <Form {...form}>
              <div className="space-y-4">
                <FormInput
                  value={fullName}
                  disabled
                  name="fullName"
                  label={t("fullName")}
                  placeholder={t("fullName-placeholder")}
                  className={"h-10 bg-[#F3F6F3]"}
                  labelClassName="text-[#161D14]/50"
                />
                <FormInput
                  disabled
                  value={user?.email ?? ""}
                  type={"email"}
                  name="email"
                  label={t("email")}
                  placeholder={t("email-placeholder")}
                  className={"h-10 bg-[#F3F6F3]"}
                  labelClassName="text-[#161D14]/50"
                />
                <FormInput
                  disabled
                  value={user?.department ?? ""}
                  name="department"
                  label={t("department")}
                  placeholder={t("department-placeholder")}
                  className={"h-10 bg-[#F3F6F3]"}
                  labelClassName="text-[#161D14]/50"
                />
                <FormInput
                  disabled
                  value={user?.role ?? ""}
                  name="role"
                  label={t("role")}
                  placeholder={t("role-placeholder")}
                  className={"h-10 bg-[#F3F6F3]"}
                  labelClassName="text-[#161D14]/50"
                />

                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => {
                    const handlePhoneChange = (value: string) => {
                      // Update country when phone number changes
                      if (value) {
                        field.onChange(value);
                        try {
                          const phone = parsePhoneNumber(value);
                          if (phone?.country) {
                            setCurrentCountry(phone.country);
                          }
                        } catch {
                          // Keep current country if parsing fails
                        }
                      }
                    };
                    return (
                      <FormItem className="w-full space-y-2">
                        <FormLabel>{t("phone")}</FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            onChange={handlePhoneChange}
                            defaultCountry={currentCountry}
                            international={false}
                            placeholder={t("phone-placeholder")}
                            className="bg-primary-light h-10 w-full items-center rounded-md placeholder:text-[#525C4E]"
                            countrySelectProps={{
                              className: "bg-primary-light h-10 rounded-s-md",
                            }}
                            key={currentCountry} // Force re-render when country changes
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </Form>

            <PrimaryButton
              type={"button"}
              onClick={() => {
                void handleSubmit(handleFormSubmit)();
              }}
              className="mt-8 w-full"
              buttonContent={t("save")}
              disabled={!formState.isValid}
              isLoading={isPending}
            />
          </div>
        </AppDialogContent>
      }
    />
  );
};

export default EditAccountDialog;
