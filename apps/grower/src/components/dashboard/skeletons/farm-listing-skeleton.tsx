export default function FarmListingSkeleton() {
  return (
    <div className="mb-24 flex items-center justify-center px-0 py-6 sm:py-8 md:px-4 xl:mb-0">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative h-[400px] w-full animate-pulse overflow-hidden rounded-2xl border-0 shadow-lg"
          >
            <div className="bg-gray-light absolute inset-0"></div>
            <div className="relative z-10 flex h-full flex-col justify-end space-y-4 p-2">
              <div className="relative flex flex-col justify-between rounded-2xl bg-white/95 p-4 backdrop-blur-sm">
                <div className="bg-gray-light mb-2 h-4 w-3/4 rounded"></div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-[90px] space-y-1 rounded-md border p-1.5 md:p-2"
                    >
                      <div className="bg-gray-light h-3 w-1/2 rounded"></div>
                      <div className="bg-gray-light h-3 w-full rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
