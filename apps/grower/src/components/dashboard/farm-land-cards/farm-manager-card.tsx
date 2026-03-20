"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Form, FormInput } from "@cf/ui/components/form";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { logger } from "@sentry/nextjs";
import { Check, Edit, Plus, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useApiClient } from "@/lib/api";
import { addressDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";
import { useLocalizedErrorHandler } from "@/lib/utils/localized-error-handler";
import { showErrorToast } from "@/lib/utils/toast";

interface FarmManagerProps {
  name?: string | null;
  onSave?: (data: FarmManagerData) => void;
}

interface FarmManagerData {
  name: string;
}

export default function FarmManagerCard({ name }: FarmManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const t = useTranslations("FarmLands.farmDetails");
  const tError = useTranslations("auth.errors");
  const params = useParams();
  const router = useRouter();

  const farmId = params.id as string;
  const { userId: authUserId } = useAuthUser();
  const api = useApiClient();
  const { handleError } = useLocalizedErrorHandler();

  const form = useForm<FarmManagerProps>({
    resolver: zodResolver(addressDetailsSchema()),
    defaultValues: {
      name: name || "",
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const handleSave = (data: FarmManagerProps) => {
    setIsLoading(true);
    logger.info(data.name ?? "");
    setIsLoading(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleSelfAssign = async () => {
    setIsProcessing(true);
    try {
      const { error: postError, data: selfAssign } = await api.client.POST(
        "/farm-management/self-assign",
        {
          body: { farmId: farmId, farmOwnerId: authUserId || "" },
        },
      );

      if (
        postError?.errors?.some((err) =>
          err.message
            ?.toLowerCase()
            .includes("maximum number of active/renewed contracts"),
        )
      ) {
        handleError("maximum number of active/renewed contracts");
        return;
      } else if (
        postError?.errors?.some((err) =>
          err.message
            ?.toLowerCase()
            .includes("An active contract already exists"),
        )
      ) {
        showErrorToast(tError("already_managing"));
        return;
      }

      if (!selfAssign) {
        showErrorToast(tError("error_assigning_self"));
        return;
      }

      router.push(`/farm-owner/farm-managers/assign-myself/success`);
    } catch (error) {
      showErrorToast("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };
  if (!name) {
    return (
      <Card className="w-full rounded-lg border-none bg-white">
        <CardHeader className="pb-0 pt-2">
          <p className="text-gray-dark text-xs font-thin">
            {t("managerTitle")}
          </p>
        </CardHeader>
        <CardContent className="relative">
          <Button
            ref={buttonRef}
            variant="unstyled"
            size="sm"
            onClick={() => setShowModal(!showModal)}
            className="text-primary flex items-center gap-2"
            disabled={isProcessing}
          >
            Add farm manager
            <Plus className="size-4" />
          </Button>

          {/* Modal */}
          {showModal && (
            <div
              ref={modalRef}
              className="border-input absolute right-0 top-12 z-50 min-w-[309px] rounded-xl border bg-white p-3 shadow-xl sm:right-4 md:right-8"
            >
              <div className="flex flex-col gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full rounded-lg text-sm"
                  onClick={handleSelfAssign}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Assigning..." : "Assign myself"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full rounded-lg text-sm"
                  onClick={() =>
                    handleNavigate(
                      "/farm-owner/invite-farm-manager/manager-info",
                    )
                  }
                >
                  Invite farm manager
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full rounded-lg text-sm"
                  onClick={() =>
                    handleNavigate("/farm-owner/farm-managers/hire-manager")
                  }
                >
                  Request to hire
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full rounded-lg border-none bg-white">
      <CardHeader className="pb-0 pt-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-dark text-xs font-thin">
            {t("managerTitle")}
          </p>
          {isEditing ? (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="unstyled"
                className="text-primary p-0 leading-none"
                onClick={handleSubmit(handleSave)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="size-4" />
                ) : (
                  <Check className="size-4" />
                )}
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="unstyled"
                className="text-destructive"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="unstyled"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-primary"
            >
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div>
            {[{ label: "Farm manager", value: name }].map(
              ({ label, value }) => (
                <div
                  key={label}
                  className="flex items-end justify-between md:block"
                >
                  <p className="text-md font-normal leading-tight">{value}</p>
                </div>
              ),
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleSave)}
              className="w-full space-y-6"
            >
              <FormInput
                name="name"
                label="Name"
                placeholder="Enter farm name"
                className="border-input-border rounded-lg border border-solid"
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
