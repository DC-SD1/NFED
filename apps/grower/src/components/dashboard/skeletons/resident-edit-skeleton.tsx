export default function ResidentEditKycErrorSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center px-1 py-2 md:px-4">
      <div className="w-full max-w-lg space-y-8 md:max-w-4xl lg:max-w-2xl">
        {/* Header skeleton */}
        <div className="space-y-3 text-center">
          <div className="bg-gray-semi mx-auto h-4 w-3/4 animate-pulse rounded"></div>
        </div>

        {/* Skeleton form structure */}
        <div className="space-y-8 opacity-30">
          {/* Upload ID section */}
          <div className="space-y-4">
            <div className="bg-gray-semi h-4 w-1/4 animate-pulse rounded"></div>
            <div className="bg-gray-light h-24 rounded-lg border-2 border-dashed "></div>
          </div>

          {/* Upload Passport section */}
          <div className="space-y-4">
            <div className="bg-gray-semi h-4 w-1/3 animate-pulse rounded"></div>
            <div className="bg-gray-light h-24 rounded-lg border-2 border-dashed "></div>
          </div>

          {/* Expiry Date section */}
          <div className="space-y-4">
            <div className="bg-gray-semi h-4 w-1/4 animate-pulse rounded"></div>
            <div className="bg-gray-light h-10 w-3/4 rounded border xl:w-1/2"></div>
          </div>

          {/* Proof of Address section */}
          <div className="space-y-4">
            <div className="bg-gray-semi h-4 w-1/3 animate-pulse rounded"></div>
            <div className="bg-gray-light h-24 rounded-lg border-2 border-dashed"></div>
          </div>

          {/* Submit button skeleton */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-semi h-10 w-3/4 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
