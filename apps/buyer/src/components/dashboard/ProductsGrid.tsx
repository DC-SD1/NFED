"use client";
import React from "react";

import { useProductFilters } from "@/contexts/ProductFiltersContext";
import { useApiClient } from "@/lib/api";

import type { ProductItem } from "./ProductCard";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductsGridProps {
  className?: string;
  products?: ProductItem[];
}

export function ProductsGrid({
  className,
  products: staticProducts,
}: ProductsGridProps) {
  const api = useApiClient();
  const { debouncedSearchTerm, debouncedCategory } = useProductFilters();

  // Create stable query parameters that only change when debounced values change
  const queryParams = React.useMemo(
    () => ({
      SearchTerm: debouncedSearchTerm.trim() || null,
      Category: debouncedCategory === "all" ? null : debouncedCategory || null,
      Incoterms: null,
      MinPrice: null,
      MaxPrice: null,
      Status: null,
      Condition: null,
      Grade: null,
      SortBy: null,
      SortDescending: false,
      PageNumber: 1,
      PageSize: 10,
      IncludeSpecifications: false,
      IncludeCertifications: false,
      IncludeAvailability: false,
    }),
    [debouncedSearchTerm, debouncedCategory],
  );

  // Only make API call if we don't have static products
  const shouldFetch = !staticProducts;

  const { data, isPending } = api.useQuery("get", "/products/catalog", {
    params: {
      query: queryParams,
    },
    enabled: shouldFetch, // Only fetch when we should
  });

  // Use static products if provided, otherwise use API data
  const products =
    staticProducts ||
    (data?.value?.items ?? []).map((product) => ({
      id: product.cropId || product.id || "",
      name: product.cropName || "Unknown Product",
      image: product.cropImageUrl || "/placeholder-image.jpg",
      category: product.cropCategory || "Uncategorized",
      quantity: product.amount || 0,
      details: [
        { title: "Variety", value: product.cropVarietyName || "N/A" },
        { title: "Incoterms", value: product.incoterms || "N/A" },
        {
          title: "Price",
          value: product.amount ? `$${product.amount}` : "N/A",
        },
      ],
    }));

  // Show loading skeleton when fetching API data and no static products provided
  if (!staticProducts && isPending) {
    return (
      <div
        className={
          className ||
          "grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 lg:grid-cols-3"
        }
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        className ||
        "grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 lg:grid-cols-3"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
