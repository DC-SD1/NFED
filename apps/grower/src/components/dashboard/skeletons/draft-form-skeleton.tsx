import React from "react";

// Skeleton component for the Draft Invite Manager Form
export function DraftInviteManagerFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title Skeleton */}
      <div className="text-center">
        <div className="mx-auto h-8 w-64 rounded-md bg-gray-200"></div>
      </div>

      {/* Description Skeleton */}
      <div className="text-center">
        <div className="mx-auto h-4 w-80 rounded bg-gray-200"></div>
      </div>

      {/* Personal Information Section Skeleton */}
      <div className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 rounded-lg border border-gray-300 bg-gray-200"></div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 rounded-lg border border-gray-300 bg-gray-200"></div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-12 rounded-lg border border-gray-300 bg-gray-200"></div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200"></div>
          <div className="flex h-12 rounded-lg border border-gray-300 bg-gray-200">
            <div className="w-20 rounded-l-lg bg-gray-300"></div>
            <div className="flex-1 bg-gray-200"></div>
          </div>
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200"></div>
          <div className="h-12 rounded-lg border border-gray-300 bg-gray-200"></div>
        </div>
      </div>

      {/* Work Type Section Skeleton */}
      <div className="space-y-4">
        {/* Work Type Title */}
        <div className="text-center">
          <div className="mx-auto h-4 w-24 rounded bg-gray-200"></div>
        </div>

        {/* Work Type Radio Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Work Pay Type Section Skeleton */}
      <div className="space-y-4">
        {/* Work Pay Type Title */}
        <div className="text-center">
          <div className="mx-auto h-4 w-28 rounded bg-gray-200"></div>
        </div>

        {/* Work Pay Type Radio Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4">
            <div className="size-4 rounded-full bg-gray-200"></div>
            <div className="h-4 w-14 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="mt-8 space-y-4">
        {/* Send Button */}
        <div className="h-12 w-full rounded-xl bg-gray-200"></div>

        {/* Save and Close Button */}
        <div className="h-12 w-full rounded-xl bg-gray-200"></div>
      </div>
    </div>
  );
}

// Alternative more detailed skeleton with better visual representation
export function DraftInviteManagerFormSkeletonDetailed() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="animate-pulse text-center">
        <div className="animate-shimmer mx-auto h-8 w-64 rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>

      {/* Description Skeleton */}
      <div className="animate-pulse text-center">
        <div className="animate-shimmer mx-auto h-4 w-80 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
      </div>

      {/* Form Content */}
      <div className="animate-pulse space-y-6">
        {/* Personal Information Fields */}
        {[
          { label: "First Name", width: "w-20" },
          { label: "Last Name", width: "w-20" },
          { label: "Email", width: "w-16" },
          { label: "Years of Experience", width: "w-32" },
        ].map((field, index) => (
          <div key={index} className="space-y-2">
            <div className={`h-4 rounded bg-gray-200 ${field.width}`}></div>
            <div className="relative h-12 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100">
              <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        ))}

        {/* Phone Number Field - Special Layout */}
        <div className="space-y-2">
          <div className="h-4 w-28 rounded bg-gray-200"></div>
          <div className="flex h-12 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100">
            <div className="relative w-20 bg-gray-200">
              <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
            <div className="relative flex-1 bg-gray-100">
              <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Work Type Section */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto h-4 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="relative flex items-center space-x-3 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
              >
                <div className="size-4 rounded-full bg-gray-200"></div>
                <div
                  className={`h-4 rounded bg-gray-200 ${item === 1 ? "w-20" : "w-24"}`}
                ></div>
                <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Pay Type Section */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto h-4 w-28 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="relative flex items-center space-x-3 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
              >
                <div className="size-4 rounded-full bg-gray-200"></div>
                <div
                  className={`h-4 rounded bg-gray-200 ${
                    item === 1 ? "w-16" : item === 2 ? "w-20" : "w-14"
                  }`}
                ></div>
                <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="relative h-12 w-full overflow-hidden rounded-xl bg-gray-200">
            <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
          <div className="relative h-12 w-full overflow-hidden rounded-xl bg-gray-200">
            <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
