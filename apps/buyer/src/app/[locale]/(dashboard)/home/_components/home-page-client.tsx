"use client";

import { CropHeader } from "@/components/dashboard/CropHeader";
import { ProductsGrid } from "@/components/dashboard/ProductsGrid";
import { ProductFiltersProvider, useProductFilters } from "@/contexts/ProductFiltersContext";

function HomePageContent() {
  const { filters, setSearchTerm, setCategory } = useProductFilters();

  return (
    <>
      <CropHeader
        searchTerm={filters.searchTerm}
        category={filters.category}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategory}
      />
      <ProductsGrid />
    </>
  );
}

export function HomePageClient() {
  return (
    <ProductFiltersProvider>
      <HomePageContent />
    </ProductFiltersProvider>
  );
}
