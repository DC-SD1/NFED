"use client";

import { Avatar, AvatarFallback, Button, Card, CardContent } from "@cf/ui";

import {
  getContractStatusDisplay,
  getStatusColorClass,
} from "@/utils/mapping-helper";

interface UserProfileCardProps {
  name: string;
  status: string;
  yearsOfExperience: number;
  assignedGrower: number;
  avatarInitial?: string;
  avatarBgColor?: string;
  onUpdate?: () => void;
}

export default function UserProfileCard({
  name,
  status,
  yearsOfExperience,
  assignedGrower,
  avatarInitial,
}: UserProfileCardProps) {
  const initial = avatarInitial || name.charAt(0).toUpperCase();

  return (
    <Card className="w-full rounded-3xl border-none">
      <CardContent className="relative p-6">
        <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <Avatar width="w-16" height="h-16">
                <AvatarFallback
                  width="w-16"
                  height="h-16"
                  className="bg-primary-darkest text-primary-lightest text-2xl font-bold"
                >
                  {initial}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="mb-2 text-lg font-semibold">{name}</h3>
                <p className="text-gray-dark text-sm">
                  Status:{" "}
                  <span className={getStatusColorClass(status)}>
                    {getContractStatusDisplay(status)}
                  </span>
                </p>
              </div>
            </div>
            <div className="hidden lg:flex">
              <Button variant="unstyled" className="text-primary p-0 text-sm">
                Add profile image
              </Button>
            </div>

            {/* Mobile & Tablet view: Smaller stats cards aligned left */}
            <div className="mt-4 flex gap-3 lg:hidden">
              <div className="bg-userDropdown-background rounded-lg p-3 text-left">
                <p className="text-gray-dark mb-1 text-sm">
                  Years of experience
                </p>
                <p className="text-lg font-bold">{yearsOfExperience}</p>
              </div>
              <div className="bg-userDropdown-background rounded-lg p-3 text-left">
                <p className="text-gray-dark mb-1 text-sm">Assigned grower</p>
                <p className="text-2xl font-bold">{assignedGrower}</p>
              </div>
            </div>
          </div>

          {/* Desktop view: Stats in top right */}
          <div className="absolute right-6 top-6 hidden gap-2 lg:flex">
            <div className="bg-userDropdown-background rounded-lg p-4 text-center">
              <p className="text-gray-dark mb-1 text-sm">Years of experience</p>
              <p className="text-2xl font-bold">{yearsOfExperience}</p>
            </div>
            <div className="bg-userDropdown-background rounded-lg p-4 text-center">
              <p className="text-gray-dark mb-1 text-sm">Assigned grower</p>
              <p className="text-2xl font-bold">{assignedGrower}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
