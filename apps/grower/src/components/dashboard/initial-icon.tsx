"use client";

import React from "react";

interface ProfileInitialBadgeProps {
  initial: string;
  size?: string;
  text?: string;
}

export const ProfileInitialBadge: React.FC<ProfileInitialBadgeProps> = ({
  initial,
  size = "8",
  text = "xs",
}) => {
  return (
    <div
      className={`bg-primary-darkest text-primary-lightest size-${size} text-${text} flex items-center justify-center rounded-full font-semibold`}
    >
      {initial}
    </div>
  );
};
