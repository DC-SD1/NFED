import { Button } from "@cf/ui";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { CountryForm } from "@/components/forms/country-form";

export default function CountryPage() {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="space-y-12 text-start">
        <Button
          size="icon"
          variant="outline"
          className="size-10 bg-[#F5F5F5] text-black hover:bg-[#F5F5F5]/80 hover:text-black"
          asChild
        >
          <Link href="/sign-in">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>

        <CountryForm />
      </div>
    </div>
  );
}
