"use client";

import TopLeftHeaderLayout from "@/components/dashboard/top-left-header";
import { DraftInviteManagerForm } from "@/components/forms/draft-invite-form"; // Make sure to import your api client

export default function DraftInvitePage() {
  return (
    <TopLeftHeaderLayout>
      <div className="px-4 py-6 md:items-center md:justify-center md:px-6 md:pt-0 lg:px-8">
        <div className="mx-auto w-full max-w-sm md:max-w-lg lg:max-w-2xl">
          <h1 className="mb-4 hidden text-start text-3xl font-bold tracking-tight md:block lg:text-center">
            Invite farm manager
          </h1>
          <DraftInviteManagerForm />
        </div>
      </div>
    </TopLeftHeaderLayout>
  );
}
