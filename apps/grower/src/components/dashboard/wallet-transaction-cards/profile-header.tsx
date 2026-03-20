"use client";

import { getExperienceStatus, getInitials } from "./personal-details-utils";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  yearsOfExperience: number;
  onAddImage: () => void;
}

export function ProfileHeader({
  firstName,
  lastName,
  yearsOfExperience,
  onAddImage,
}: ProfileHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-center space-y-3  pb-6 md:items-start">
      <div className="flex items-center gap-4">
        <div className="flex size-24 items-center justify-center rounded-full bg-[#235C4B] text-3xl font-semibold text-white">
          {getInitials(firstName, lastName)}
          {/* TODO: ADD IMAGE FROM API if it exists */}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">
            {firstName} {lastName}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-dark">Status:</span>
            <span className="text-sm font-medium text-primary">
              {getExperienceStatus(yearsOfExperience)}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="cursor-pointer text-sm font-medium text-primary"
        onClick={onAddImage}
      >
        Add profile image
      </button>
    </div>
  );
}
