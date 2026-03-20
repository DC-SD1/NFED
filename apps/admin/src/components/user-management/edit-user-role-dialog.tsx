/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Form } from "@cf/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import PrimaryButton from "@/components/buttons/primary-button";
import { FormSearchableDropdown } from "@/components/input-components/form-searchable-dropdown";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import { useApiClient } from "@/lib/api";
import { type EditRoleData, EditRoleSchema } from "@/lib/schemas/role-schema";
import { useModal } from "@/lib/stores/use-modal";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { RoleResponse } from "@/types/user-management.types";

const EditUserRoleDialog = () => {
  const { isOpen, type, onClose, data } = useModal();
  const t = useTranslations("userManagement.editUserRole");
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "EditUserRole";
  const api = useApiClient();
  const queryClient = useQueryClient();

  const user = data?.user;

  const form = useForm<EditRoleData>({
    resolver: zodResolver(EditRoleSchema),
    defaultValues: {
      role: "",
    },
  });

  const { control, handleSubmit, formState, setValue, reset } = form;

  useEffect(() => {
    setValue("role", user?.role ?? "");
  }, [user?.role]);

  const { data: roleResponse, isPending: isLoadingRoles } = api.useQuery(
    "get",
    "/admin/roles",
  );

  const response = roleResponse as any as RoleResponse;
  const ROLES = (response?.data ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const { mutate, isPending } = api.useMutation(
    "put",
    "/admin/users/{UserId}/role",
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["get", "/admin/dashboard/users"],
        });

        showSuccessToast(`User role updated successfully`);
        onClose();
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

  const handleFormSubmit = (data: EditRoleData) => {
    mutate({
      body: {
        newRole: data.role,
      },
      params: {
        path: { UserId: user?.id ?? "" },
      },
    });
  };

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  return (
    <AppDialog
      key={"invite-user-dialog"}
      isOpen={isOpen}
      size={"small"}
      title={t("title")}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
      content={
        <AppDialogContent className={"flex flex-col gap-14"}>
          <Form {...form}>
            <div className="space-y-6">
              <FormSearchableDropdown
                label={t("assignedRole")}
                control={control}
                placeholder={isLoadingRoles ? "Loading..." : t("chooseRole")}
                name={"role"}
                options={ROLES}
              />
            </div>
          </Form>
          <PrimaryButton
            onClick={() => {
              void handleSubmit(handleFormSubmit)();
            }}
            className="w-full px-8 text-white"
            buttonContent={t("saveButton")}
            disabled={!formState.isValid}
            isLoading={isPending}
          />
        </AppDialogContent>
      }
    />
  );
};

export default EditUserRoleDialog;
