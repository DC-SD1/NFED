"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md space-y-6 text-center">
            <div className="text-6xl">🚨</div>

            <h2 className="text-3xl font-bold text-gray-900">
              Something went wrong!
            </h2>

            <p className="text-gray-600">
              A critical error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Try again
            </button>

            {error.digest && (
              <p className="text-xs text-gray-500">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
