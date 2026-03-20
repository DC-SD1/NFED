import { ReviewList } from "../_components/onboarding/review/review-list";

export default function ReviewPage() {
  return (
    <div className="w-full space-y-8 pt-0 lg:w-[672px] lg:pt-20">
      <div className="space-y-2">
        <h3 className="text-muted text-2xl font-bold md:text-3xl lg:text-4xl">
          Review your information and documents
        </h3>
        <p className="text-muted-foreground text-sm">
          Take a moment to review your information.
        </p>
      </div>

      <ReviewList />
    </div>
  );
}
