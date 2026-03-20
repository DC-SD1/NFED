"use client";

import { Button, cn } from "@cf/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import InputComponent from "@/components/input-components/input-component";
import { SearchableDropdown } from "@/components/input-components/searchable-dropdown";
import AppDialog from "@/components/modals/app-dialog";
import AppDialogContent from "@/components/modals/app-dialog-content";
import AppDialogFooter from "@/components/modals/app-dialog-footer";
import { useApiClient } from "@/lib/api";
import { useModal } from "@/lib/stores/use-modal";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/lib/utils/toast";
import type { RoleResponse } from "@/types/user-management.types";
import {
  emailAlreadyExists,
  hasDuplicateEmails,
  hasInvalidEmails,
  hasMissingFields,
  isCompleteFarmerEmail,
  isValidEmail,
} from "@/utils/helpers/user-invitation-helpers";

import PrimaryButton from "../buttons/primary-button";

const InviteUserDialog = () => {
  const { isOpen, type, onClose } = useModal();
  const t = useTranslations("userManagement.inviteUser");
  const tt = useTranslations("common.errors");
  const isModalOpen = isOpen && type === "InviteUser";
  const api = useApiClient();
  const queryClient = useQueryClient();

  const [users, setUsers] = useState([{ email: "", role: "" }]);

  const { data: roleResponse, isPending: isLoadingRoles } = api.useQuery(
    "get",
    "/admin/roles",
  );

  const response = roleResponse as any as RoleResponse;
  const ROLES = (response?.data ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const { mutate, isPending } = api.useMutation("post", "/admin/send-invite", {
    onSuccess: async (data: any) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["get", "/admin/metrics"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["get", "/admin/dashboard/users"],
        }),
      ]);
      showSuccessToast(
        data?.message ??
          `${filledInvites.length} ${filledInvites.length === 1 ? "User" : "Users"} invited successfully`,
      );

      onClose();
    },
    onError: (error: any) => {
      showErrorToast(error?.message ?? tt("unknown_error"));
    },
  });

  // Function to add a new user row
  const addUser = () => {
    if (hasMissingFields(users)) {
      showInfoToast("Please fill in all fields");
      return;
    }

    const newUser = {
      email: "",
      role: "",
    };
    setUsers((prev) => [...prev, newUser]);
  };

  // Function to remove a user row
  const removeUser = (index: number) => {
    if (users.length > 1) {
      // Keep at least one row
      setUsers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Function to update user data
  const updateUser = (index: number, field: string, value: string) => {
    // Update the user if email doesn't exist or we're updating other fields
    setUsers((prev) =>
      prev.map((user, i) => (i === index ? { ...user, [field]: value } : user)),
    );
  };

  const filledInvites = users.filter(
    (user) => user.email.trim() !== "" && user.role.trim() !== "",
  );

  if (!isModalOpen) return null;

  const handleSendInvite = () => {
    if (hasInvalidEmails(users)) {
      showInfoToast(t("invalidEmails"));
      return;
    }

    if (hasDuplicateEmails(users)) {
      showInfoToast(t("duplicateEmails"));
      return;
    }

    if (hasMissingFields(users)) {
      showInfoToast(t("missingFields"));
      return;
    }

    if (filledInvites.length > 0) {
      mutate({
        body: {
          users: filledInvites.map((user) => ({
            emailAddress: user.email,
            role: user.role,
          })),
        },
      });
    }
  };

  const handleCloseModal = () => {
    setUsers([{ email: "", role: "" }]);
    onClose();
  };

  return (
    <AppDialog
      key={"invite-user-dialog"}
      isOpen={isOpen}
      size={"xlarge"}
      title={t("title")}
      onOpenChange={(_) => {
        handleCloseModal();
      }}
      content={
        <>
          <AppDialogContent>
            <div className="flex flex-col gap-[28px]">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="text-secondary-foreground bg-[#F3F6F3] text-xs">
                      <th className="w-1/2 rounded-tl-lg px-4 py-2 text-left">
                        {t("workEmail")}
                      </th>
                      <th className="w-1/2 border-l px-4 py-2 text-left">
                        {t("assignRole")}
                      </th>
                      <th className={"rounded-tr-lg"}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={i}>
                        <td className="text-left">
                          <div className={"w-full"}>
                            <InputComponent
                              value={user.email}
                              onChange={(e) =>
                                updateUser(i, "email", e.target.value)
                              }
                              placeholder={"example@completefarmer.com"}
                              className="w-full border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {user.email && !isValidEmail(user.email) && (
                              <p className="px-3 text-xs text-red-500">
                                {t("invalidEmail")}
                              </p>
                            )}
                            {user.email &&
                              !isCompleteFarmerEmail(user.email) && (
                                <p className="px-3 text-xs text-red-500">
                                  {t("incompleteFarmerEmail")}
                                </p>
                              )}
                            {user.email &&
                              emailAlreadyExists(user.email, users) && (
                                <p className="px-3 text-xs text-red-500">
                                  {t("emailAlreadyExists")}
                                </p>
                              )}
                          </div>
                        </td>
                        <td className="border-l text-left">
                          <div className={"w-full pl-1"}>
                            <SearchableDropdown
                              defaultValue={user.role}
                              onValueChange={(option) =>
                                updateUser(i, "role", option.value)
                              }
                              options={ROLES}
                              placeholder={
                                isLoadingRoles ? "Loading..." : t("chooseRole")
                              }
                              className="w-full border-none focus-visible:ring-0"
                              innerTriggerClassName="border-none !bg-transparent focus-visible:ring-0"
                            />
                          </div>
                        </td>
                        <td
                          className={cn(
                            "text-center",
                            users.length > 1 && "border-l",
                          )}
                        >
                          {users.length > 1 && (
                            <Button
                              tabIndex={-1}
                              onClick={() => removeUser(i)}
                              size={"sm"}
                              className="font-semibold text-[#161D14] hover:bg-transparent hover:text-[#161D14]"
                              variant={"ghost"}
                            >
                              <X className="size-6" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <Button
                  onClick={addUser}
                  size={"sm"}
                  className="font-semibold text-[#1A5514]"
                  variant={"secondary"}
                >
                  <Plus className="size-4" />
                  {t("addUser")}
                </Button>
              </div>
            </div>
          </AppDialogContent>
          <AppDialogFooter className="flex justify-end">
            <PrimaryButton
              onClick={handleSendInvite}
              disabled={
                filledInvites.length === 0 ||
                isPending ||
                hasInvalidEmails(users) ||
                hasDuplicateEmails(users) ||
                hasMissingFields(users)
              }
              isLoading={isPending}
              buttonContent={t("inviteButton")}
              className="rounded-xl px-8 text-white"
            />
          </AppDialogFooter>
        </>
      }
    />
  );
};

export default InviteUserDialog;
