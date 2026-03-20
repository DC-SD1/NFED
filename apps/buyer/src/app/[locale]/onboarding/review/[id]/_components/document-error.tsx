import { Button } from "@cf/ui";

export default function DocumentError() {
  return (
    <div className="relative divide-y divide-[#E5E7EB] md:pb-20 lg:pb-0">
      <div className="py-8 text-center">
        <p className="text-red-600">Failed to load KYC data. Please try again.</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}