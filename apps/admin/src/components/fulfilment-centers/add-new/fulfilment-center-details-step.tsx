"use client";

import {
  cn,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cf/ui";
import { PhoneInput } from "@cf/ui/components/phone-input";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import type { useForm } from "react-hook-form";
import { type Country, parsePhoneNumber } from "react-phone-number-input/min";

import FlagComponent from "@/components/common/flag-component";
import MultiPhotoUploader from "@/components/file-upload/multi-photo-uploader";
import { FormDropdownComponent } from "@/components/input-components/form-dropdown-component";
import { FormMultiTagDropdown } from "@/components/input-components/form-muti-tag-dropdown";
import { FormQueryMultiTagDropdown } from "@/components/input-components/form-query-muti-tag-dropdown";
import { FormSearchableDropdown } from "@/components/input-components/form-searchable-dropdown";
import InputComponent from "@/components/input-components/input-component";
import LocationInput from "@/components/input-components/location-input";
import { useCountries } from "@/hooks/use-countries";
import { useDebounce } from "@/hooks/use-debounce";
import { useRestoreFulfilmentCenterFormData } from "@/hooks/use-restore-fulfilment-center-form-data";
import { useApiClient } from "@/lib/api";
import type { CenterDetailData } from "@/lib/schemas/fulfilment-center-schema";
import useFulfilmentCenterStore from "@/lib/stores/fulfilment-center-store/fufilment-center-store";
import { capitalizeFirst, findOption } from "@/utils/helpers/common-helpers";

const SAMPLE_COUNTRIES = [
  { id: "1", name: "Ghana", code: "GH" },
  { id: "2", name: "Togo", code: "TG" },
];

const SAMPLE_CROPS = [
  { name: "Chilli Pepper" },
  { name: "Soybean" },
  { name: "Groundnut" },
];

interface Props {
  form: ReturnType<typeof useForm<CenterDetailData>>;
  className?: string;
}

const SAMPLE_REGIONS = [
  { id: "1", name: "Ashanti region" },
  { id: "2", name: "Eastern region" },
  { id: "3", name: "Northern region" },
  { id: "4", name: "Western region" },
  { id: "5", name: "Central region" },
  { id: "6", name: "Greater Accra Region" },
  { id: "7", name: "Volta region" },
];

const SAMPLE_DISTRICTS = [
  { name: "Adaklu District" },
  { name: "Akatsi North District" },
  { name: "Akatsi South District" },
  { name: "Basse District" },
  { name: "Central Tongu District" },
  { name: "Ho Municipal District" },
  { name: "Hohoe Municipal District" },
];

// eslint-disable-next-line max-lines-per-function
export default function FulfilmentCenterDetailsStep({
  form,
  className,
}: Props) {
  const t = useTranslations("fulfillmentCenters.addNewCenter.detailsTab");
  const [currentCountry, setCurrentCountry] = useState<Country>("GH");
  const { control, setValue } = form;
  const { setFormData, cacheFormData } = useFulfilmentCenterStore();
  const api = useApiClient();
  const { getCountryCode } = useCountries();
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(districtSearchTerm);
  useRestoreFulfilmentCenterFormData(cacheFormData, setValue);

  const handlePhoneChange = (value: string) => {
    // Update country when phone number changes
    if (value) {
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

  const { data: response, isPending: _isLoadingCountries } = api.useQuery(
    "get",
    "/geography/countries",
    {
      enabled: false,
    },
  );

  const isLoadingCountries = false;

  const COUNTRY_LIST = (
    response?.data && response.data.length > 0
      ? response.data
      : SAMPLE_COUNTRIES
  ).map((item) => ({
    value: item.name ?? "",
    label: item.name ?? "",
    code:
      (item as any).code ??
      getCountryCode(capitalizeFirst(item.name ?? "")) ??
      "",
    id: item.id ?? "",
  }));

  const selectedCountryId = findOption(COUNTRY_LIST, form.watch("country"))?.id;

  const { data: regionResponse, isLoading: _isLoadingRegions } = api.useQuery(
    "get",
    "/geography/regions",
    {
      params: {
        query: {
          CountryId: selectedCountryId,
        },
      },
    },
    {
      enabled: false,
    },
  );

  const isLoadingRegions = false;

  const REGION_LIST =
    (regionResponse?.data && regionResponse.data.length > 0
      ? regionResponse.data
      : SAMPLE_REGIONS
    ).map((item) => ({
      value: item.name ?? "",
      label: item.name ?? "",
      id: item.id ?? "",
    })) || [];

  const selectedRegionId = findOption(REGION_LIST, form.watch("region"))?.id;

  const { data: districtResponse, isLoading: _isLoadingDistricts } =
    api.useQuery(
      "get",
      "/geography/districts",
      {
        params: {
          query: {
            PageNo: 1,
            PageSize: 20,
            RegionId: selectedRegionId,
            ...(debouncedSearchTerm !== "" && {
              SearchTerm: debouncedSearchTerm,
            }),
          },
        },
      },
      {
        enabled: false,
      },
    );

  const isLoadingDistricts = false;

  const DISTRICT_LIST =
    (districtResponse?.data?.data && districtResponse.data.data.length > 0
      ? districtResponse.data.data
      : SAMPLE_DISTRICTS.filter((d) =>
          d.name.toLowerCase().includes(districtSearchTerm.toLowerCase()),
        )
    ).map((item) => ({
      value: item.name ?? "",
      label: item.name ?? "",
    })) || [];

  const { data: cropsResponse, isPending: _isLoadingCrops } = api.useQuery(
    "get",
    "/crop/get_all",
    {
      enabled: false,
    },
  );

  const isLoadingCrops = false;

  const CROPS_LIST =
    (cropsResponse?.value && cropsResponse.value.length > 0
      ? cropsResponse.value
      : SAMPLE_CROPS
    ).map((item) => ({
      value: item?.name ?? "",
      label: item?.name ?? "",
    })) || [];

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
          <FormField
            control={control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem className="w-full space-y-2">
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <InputComponent
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setFormData({ name: e.target.value });
                      }}
                      value={field.value || ""}
                      name={"name"}
                      placeholder={t("namePlaceholder")}
                      className="bg-primary-light"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-normal" />
                </FormItem>
              );
            }}
          />
          <FormDropdownComponent
            name={"country"}
            control={control}
            label={t("country")}
            placeholder={
              isLoadingCountries ? "Loading..." : t("countryPlaceholder")
            }
            options={COUNTRY_LIST}
            renderLabel={(option) => (
              <div className="flex items-center gap-4">
                {option.value !== "" && (
                  <FlagComponent countryCode={option.code as string} />
                )}
                <p>{option.label}</p>
              </div>
            )}
            renderValue={(option) => (
              <div className="flex items-center gap-4">
                <p>{option?.label ?? t("countryPlaceholder")}</p>
              </div>
            )}
            onValueChanged={(option) => {
              setValue("phoneNumber", "", { shouldDirty: true });
              setFormData({ phoneNumber: "" });
              setCurrentCountry((option?.code as Country) ?? "GH");
              setFormData({ country: option?.value ?? "" });
            }}
            className="bg-primary-light"
          />

          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => {
              return (
                <FormItem className="w-full space-y-2">
                  <FormLabel>{t("phoneNumber")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                        handlePhoneChange(value);
                        setFormData({ phoneNumber: value });
                      }}
                      defaultCountry={currentCountry}
                      international={false}
                      placeholder={t("phoneNumberPlaceholder")}
                      className="h-10 w-full items-center rounded-md bg-primary-light placeholder:text-[#525C4E]"
                      countrySelectProps={{
                        className: "bg-primary-light h-10 rounded-s-md",
                      }}
                      disabledCountrySelector={false}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-normal" />
                </FormItem>
              );
            }}
          />
          <FormSearchableDropdown
            label={t("region")}
            name={"region"}
            control={control}
            options={REGION_LIST}
            placeholder={
              isLoadingRegions ? "Loading..." : t("regionPlaceholder")
            }
            searchPlaceholder={t("regionSearchPlaceholder")}
            onValueChanged={(option) => {
              setDistrictSearchTerm("");
              setFormData({ region: option.value });
            }}
            disabled={(form.watch("country") ?? "") === ""}
            className="bg-primary-light"
            searchOuterClassName="rounded-full bg-primary-light"
          />

          <FormQueryMultiTagDropdown
            label={t("nearbyDistrictsServed")}
            name={"assignedDistricts"}
            placeholder={
              isLoadingDistricts
                ? "Loading..."
                : t("nearbyDistrictsServedPlaceholder")
            }
            searchPlaceholder={t("nearbyDistrictsServedSearchPlaceholder")}
            options={DISTRICT_LIST}
            control={control}
            onValueChanged={(options) =>
              setFormData({
                assignedDistricts: options.map((obj) => obj.value),
              })
            }
            countSuffix={"districts"}
            isSearchLoading={isLoadingDistricts}
            searchTerm={districtSearchTerm}
            onSearchTerm={setDistrictSearchTerm}
            disabled={(form.watch("region") ?? "") === ""}
            className="bg-primary-light"
          />

          <FormMultiTagDropdown
            label={t("focusCrops")}
            name={"focusCrops"}
            placeholder={
              isLoadingCrops ? "Loading..." : t("focusCropsPlaceholder")
            }
            searchPlaceholder={t("focusCropsSearchPlaceholder")}
            options={CROPS_LIST}
            control={control}
            onValueChanged={(options) =>
              setFormData({ focusCrops: options.map((obj) => obj.value) })
            }
            countSuffix={"crops"}
            className="bg-primary-light"
            searchOuterClassName="rounded-full bg-primary-light"
            notFoundText="No results found. Try another search"
          />

          <FormField
            control={control}
            name="locationAddress"
            render={({ field }) => {
              return (
                <FormItem className="w-full space-y-2">
                  <FormLabel>{t("location")}</FormLabel>
                  <FormControl>
                    <LocationInput
                      defaultValue={field.value ?? ""}
                      countryToFilterFrom={currentCountry.toLowerCase()}
                      placeholder={t("locationPlaceholder")}
                      id={"locationAddress"}
                      onChanged={(location) => {
                        field.onChange(location.address);
                        setFormData({ locationAddress: location.address });
                        setFormData({ coordinate: location.coordinates });
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-normal" />
                </FormItem>
              );
            }}
          />

          <FormField
            control={control}
            name="googleMapLink"
            render={({ field }) => {
              return (
                <FormItem className="w-full space-y-2">
                  <FormLabel>{t("mapLink")}</FormLabel>
                  <FormControl>
                    <InputComponent
                      type={"url"}
                      name={"googleMapLink"}
                      placeholder={t("mapLinkPlaceholder")}
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setFormData({ googleMapLink: e.target.value });
                      }}
                      className="bg-primary-light"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-normal" />
                </FormItem>
              );
            }}
          />

          <MultiPhotoUploader
            label={t("photos")}
            info={t("photosInfo")}
            onImagesChange={(images) => setFormData({ photos: images })}
            initialImages={cacheFormData?.photos ?? []}
            multiple={true}
          />
        </div>
      </Form>
    </div>
  );
}
