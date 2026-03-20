"use client";

import DashboardBannerImg from "@/assets/images/dashboard-banner-img.png";
import { CropHeader } from "@/components/dashboard/CropHeader";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { KycOnboardingBanner } from "@/components/dashboard/kyc-onboarding-banner";
import { OrdersTiles } from "@/components/dashboard/OrdersTiles";
import { ProductsGrid } from "@/components/dashboard/ProductsGrid";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import {
  ProductFiltersProvider,
  useProductFilters,
} from "@/contexts/ProductFiltersContext";
import { useKycStatus } from "@/lib/hooks/use-kyc-status";

import { products } from "./constants";

function DashboardProductsSection() {
  const { filters, setSearchTerm, setCategory } = useProductFilters();

  return (
    <section className="space-y-6">
      <OrdersTiles activeCount={5} continueCount={5} />
      <CropHeader
        searchTerm={filters.searchTerm}
        category={filters.category}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategory}
      />
      <ProductsGrid products={products} />
    </section>
  );
}

export default function DashboardClient() {
  const { isPending, isAccepted } = useKycStatus();

  return (
    <div className="container mx-auto mt-4 space-y-8">
      <WelcomeHeader />
      {isPending ? (
        <div className="relative h-[240px] w-full animate-pulse rounded-xl bg-gray-200"></div>
      ) : (
        <DashboardBanner src={DashboardBannerImg} />
      )}
      <KycOnboardingBanner />
      <StatsGrid />
      {isAccepted() ? (
        <ProductFiltersProvider>
          <DashboardProductsSection />
        </ProductFiltersProvider>
      ) : null}
    </div>
  );
}
