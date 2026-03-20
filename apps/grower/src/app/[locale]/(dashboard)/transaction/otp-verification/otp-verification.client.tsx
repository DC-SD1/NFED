"use client";
import { Card, CardContent } from "@cf/ui";
import { useSession } from "@clerk/nextjs";
import Image from "next/image";

import mail from "@/assets/images/message-icon.png";
import { OtpForm } from "@/components/forms/otp-form";
import { useAuthUser } from "@/lib/stores/auth-store-ssr";

export default function OtpVerificationClient() {
  const { session } = useSession();
  const authUser = useAuthUser();
  const userEmail =
    authUser.email || session?.user?.emailAddresses?.[0]?.emailAddress || "";

  return (
    <div className="container mx-auto flex  items-center justify-center ">
      <Card className="flex h-[805px] w-[844px] flex-col items-center justify-center rounded-[24px] border-none bg-white shadow-lg">
        <CardContent className="flex h-[756px] w-[640px] flex-col items-center justify-center">
          <div className="mb-6 flex justify-center">
            <Image src={mail} alt="message-icon" width={160} height={160} />
          </div>

          <div className="">
            <h1 className="mb-2 text-center text-4xl font-bold text-gray-900">
              OTP Verification
            </h1>
            <p className="mb-2 text-center text-lg text-gray-600">
              We are going to send OTP to the phone number below. Please check
              your phone and enter the OTP.
            </p>
          </div>

          <OtpForm email={userEmail} mode="verify" />
        </CardContent>
      </Card>
    </div>
  );
}
