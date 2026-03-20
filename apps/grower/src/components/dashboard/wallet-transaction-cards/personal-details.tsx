"use client";

import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { Spinner } from "@cf/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Edit, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Country } from "react-phone-number-input";

import { useProfileImageUpload } from "@/hooks/use-profile-image-upload";
import { useApiClient } from "@/lib/api";
import type { PersonalDetailsFormData } from "@/lib/schemas/farm-manager-details";
import { personalDetailsSchema } from "@/lib/schemas/farm-manager-details";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";

import { PersonalDetailsForm } from "./personal-details-form";
import { getCountryFromPhone } from "./personal-details-utils";
import { PersonalDetailsView } from "./personal-details-view";
import { ProfileCropModal } from "./profile-crop-modal";
import { ProfileHeader } from "./profile-header";
import { ProfileUploadModal } from "./profile-upload-modal";

interface PersonalDetailsData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idNumber: string;
  gender: string;
  yearsOfExperience: number;
  email: string;
  contactNumber: string;
  userId: string;
  profileImage?: string;
  onSuccess?: () => void;
  onProfilePictureUpload?: () => void;
}

export default function PersonalDetailsReviewCard(props: PersonalDetailsData) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Country>(
    getCountryFromPhone(props.contactNumber),
  );

  const api = useApiClient();
  const imageUpload = useProfileImageUpload({
    onSuccess: props.onProfilePictureUpload,
  });

  const form = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema()),
    defaultValues: {
      email: props.email,
      firstName: props.firstName,
      lastName: props.lastName,
      yearsOfExperience: props.yearsOfExperience,
      dateOfBirth: props.dateOfBirth || "",
      idNumber: props.idNumber || "",
      gender:
        props.gender && props.gender !== ""
          ? ((props.gender.charAt(0).toUpperCase() +
              props.gender.slice(1).toLowerCase()) as
              | "Male"
              | "Female"
              | "Other")
          : undefined,
      phoneNumber: props.contactNumber || "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;
  const updateUser = api.useMutation("put", "/users/{UserId}");

  const handleSave = (data: PersonalDetailsFormData) => {
    setIsLoading(true);
    const cleanedData = {
      ...data,
      dateOfBirth: data.dateOfBirth?.trim() || undefined,
      idNumber: data.idNumber?.trim() || undefined,
      contactNumber: data.phoneNumber?.trim() || undefined,
      gender: data.gender || undefined,
    };

    updateUser.mutate(
      { params: { path: { UserId: props.userId } }, body: cleanedData },
      {
        onSuccess: () => {
          showSuccessToast("Your profile was updated successfully!");
          setIsEditing(false);
          props.onSuccess?.();
        },
        onError: () => {
          showErrorToast("Failed to update your profile. Please try again.");
        },
        onSettled: () => {
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <Card className="w-[630px] rounded-[24px] border-none bg-white ">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-md font-semibold leading-none">
            Personal details
          </h2>
          {!isEditing ? (
            <Button
              variant="unstyled"
              size="sm"
              className="p-0 leading-none text-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="unstyled"
                className="p-0 leading-none text-primary"
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
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
                disabled={isLoading}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ProfileHeader
          firstName={props.firstName}
          lastName={props.lastName}
          yearsOfExperience={props.yearsOfExperience}
          onAddImage={() => imageUpload.setShowUploadModal(true)}
        />

        {!isEditing ? (
          <PersonalDetailsView {...props} />
        ) : (
          <PersonalDetailsForm
            form={form}
            control={control}
            handleSubmit={handleSubmit}
            onSubmit={handleSave}
            currentCountry={currentCountry}
            onCountryChange={setCurrentCountry}
          />
        )}
      </CardContent>

      <ProfileUploadModal
        open={imageUpload.showUploadModal}
        onOpenChange={imageUpload.setShowUploadModal}
        onFilesAdded={imageUpload.handleFilesAdded}
      />

      <ProfileCropModal
        open={imageUpload.showCropModal}
        onOpenChange={imageUpload.setShowCropModal}
        imagePreview={imageUpload.imagePreview}
        cropPosition={imageUpload.cropPosition}
        zoom={imageUpload.zoom}
        dragging={imageUpload.dragging}
        isUploading={imageUpload.isUploading}
        uploadProgress={imageUpload.uploadProgress}
        onMouseDown={imageUpload.handleMouseDown}
        onMouseMove={imageUpload.handleMouseMove}
        onMouseUp={imageUpload.handleMouseUp}
        onSaveAndUpload={imageUpload.handleSaveAndUpload}
        onUploadDifferent={imageUpload.handleUploadDifferent}
        onCancel={imageUpload.handleCancel}
      />
    </Card>
  );
}
