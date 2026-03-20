"use client";

const SAMPLE_MANAGERS = [
  {
    userId: "1",
    fullName: "James Asamoah",
    role: "RegionalOperationsManager",
  },
  {
    userId: "2",
    fullName: "Yaw Osei",
    role: "RegionalOperationsManager",
  },
  {
    userId: "3",
    fullName: "Kelvin Akoto",
    role: "RegionalOperationsManager",
  },
  {
    userId: "4",
    fullName: "Ama Serwah",
    role: "RegionalOperationsManager",
  },
  {
    userId: "5",
    fullName: "Kwame Nkrumah",
    role: "RegionalOperationsManager",
  },
  {
    userId: "6",
    fullName: "Kofi Annan",
    role: "RegionalOperationsManager",
  },
  {
    userId: "7",
    fullName: "Abena Busia",
    role: "RegionalOperationsManager",
  },
  {
    userId: "8",
    fullName: "Director 1",
    role: "OperationsDirector",
  },
  {
    userId: "9",
    fullName: "Director 2",
    role: "OperationsDirector",
  },
  {
    userId: "10",
    fullName: "Warehouse Manager 1",
    role: "WarehouseManager",
  },
  {
    userId: "11",
    fullName: "Warehouse Manager 2",
    role: "WarehouseManager",
  },
  {
    userId: "12",
    fullName: "Agronomist 1",
    role: "FieldAgronomist",
  },
  {
    userId: "13",
    fullName: "Agronomist 2",
    role: "FieldAgronomist",
  },
  {
    userId: "14",
    fullName: "Coordinator 1",
    role: "FieldCoordinator",
  },
  {
    userId: "15",
    fullName: "Coordinator 2",
    role: "FieldCoordinator",
  },
];

import { cn, Form } from "@cf/ui";
import { useTranslations } from "next-intl";
import React from "react";
import type { useForm } from "react-hook-form";

import { FormSearchableDropdown } from "@/components/input-components/form-searchable-dropdown";
import { useRestoreManagementTeamFormData } from "@/hooks/use-restore-management-team-form-data";
import { useApiClient } from "@/lib/api";
import type { ManagementTeamData } from "@/lib/schemas/fulfilment-center-schema";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";

interface Props {
  form: ReturnType<typeof useForm<ManagementTeamData>>;
  className?: string;
}

export default function ManagementTeamStep({ form, className }: Props) {
  const t = useTranslations(
    "fulfillmentCenters.addNewCenter.managementTeamTab",
  );
  const { cacheFormData, setFormData } = useFulfilmentCenterStore();
  const api = useApiClient();

  const { control, setValue } = form;

  useRestoreManagementTeamFormData(cacheFormData, setValue);

  const { data: response, isPending: _isLoadingManagers } = api.useQuery(
    "get",
    "/fulfillment-centers/available-managers",
    {
      enabled: false,
      params: {
        query: {
          Roles: [
            "RegionalOperationsManager",
            "OperationsDirector",
            "WarehouseManager",
            "FieldAgronomist",
            "FieldCoordinator",
          ],
        },
      },
    },
  );

  const isLoadingManagers = false;

  const managersData =
    response?.data && response.data.length > 0
      ? response.data
      : SAMPLE_MANAGERS;

  const ROMS = managersData
    .filter((manager) => manager.role === "RegionalOperationsManager")
    .map((manager) => ({
      value: manager.userId ?? "",
      label: manager.fullName ?? "",
    }));

  const ODS = managersData
    .filter((manager) => manager.role === "OperationsDirector")
    .map((manager) => ({
      value: manager.userId ?? "",
      label: manager.fullName ?? "",
    }));

  const WMS = managersData
    .filter((manager) => manager.role === "WarehouseManager")
    .map((manager) => ({
      value: manager.userId ?? "",
      label: manager.fullName ?? "",
    }));
  const FAS = managersData
    .filter((manager) => manager.role === "FieldAgronomist")
    .map((manager) => ({
      value: manager.userId ?? "",
      label: manager.fullName ?? "",
    }));
  const FCS = managersData
    .filter((manager) => manager.role === "FieldCoordinator")
    .map((manager) => ({
      value: manager.userId ?? "",
      label: manager.fullName ?? "",
    }));

  return (
    <div className={cn("flex flex-col gap-[26px] p-10", className)}>
      <div>
        <h1 className={"text-xl font-bold"}>{t("pageTitle")}</h1>
        <p className={"text-sm text-secondary-foreground"}>
          {t("description")}
        </p>
      </div>
      <Form {...form}>
        <div className="space-y-6">
          <FormSearchableDropdown
            name={"regionalManagerId"}
            control={control}
            label={t("regionalManager")}
            placeholder={
              isLoadingManagers ? "Loading..." : t("regionalManagerPlaceholder")
            }
            searchPlaceholder={t("regionalManagerSearchPlaceholder")}
            options={ROMS}
            onValueChanged={(option) =>
              setFormData({
                regionalManagerId: option.value,
                selectedRom: option,
              })
            }
            className="bg-primary-light"
            searchOuterClassName="rounded-full bg-primary-light"
          />
          <FormSearchableDropdown
            name={"operationsDirectorId"}
            control={control}
            label={t("operationDirector")}
            placeholder={
              isLoadingManagers
                ? "Loading..."
                : t("operationDirectorPlaceholder")
            }
            searchPlaceholder={t("operationDirectorSearchPlaceholder")}
            options={ODS}
            onValueChanged={(option) =>
              setFormData({
                operationsDirectorId: option.value,
                selectedOd: option,
              })
            }
            className="bg-primary-light"
          />
          <FormSearchableDropdown
            name={"warehouseManagerId"}
            control={control}
            label={t("warehouseManager")}
            placeholder={
              isLoadingManagers
                ? "Loading..."
                : t("warehouseManagerPlaceholder")
            }
            searchPlaceholder={t("warehouseManagerSearchPlaceholder")}
            options={WMS}
            onValueChanged={(option) =>
              setFormData({
                warehouseManagerId: option.value,
                selectedWm: option,
              })
            }
            className="bg-primary-light"
          />
          <FormSearchableDropdown
            name={"fieldAgronomistId"}
            control={control}
            label={t("fieldAgronomist")}
            placeholder={
              isLoadingManagers ? "Loading..." : t("fieldAgronomistPlaceholder")
            }
            searchPlaceholder={t("fieldAgronomistSearchPlaceholder")}
            options={FAS}
            onValueChanged={(option) =>
              setFormData({
                fieldAgronomistId: option.value,
                selectedFa: option,
              })
            }
            className="bg-primary-light"
          />
          <FormSearchableDropdown
            name={"fieldCoordinatorId"}
            control={control}
            label={t("fieldCoordinator")}
            placeholder={
              isLoadingManagers
                ? "Loading..."
                : t("fieldCoordinatorPlaceholder")
            }
            searchPlaceholder={t("fieldCoordinatorSearchPlaceholder")}
            options={FCS}
            onValueChanged={(option) =>
              setFormData({
                fieldCoordinatorId: option.value,
                selectedFc: option,
              })
            }
            className="bg-primary-light"
          />
        </div>
      </Form>
    </div>
  );
}
