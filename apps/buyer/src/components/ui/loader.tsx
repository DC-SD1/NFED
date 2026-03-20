export function Loader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      <p className="animate-pulse text-base text-gray-700">{message}</p>
    </div>
  );
}
