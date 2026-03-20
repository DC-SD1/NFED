"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ProductFilters {
  searchTerm: string;
  category: string;
}

export interface ProductFiltersContextType {
  filters: ProductFilters;
  setSearchTerm: (term: string) => void;
  setCategory: (category: string) => void;
  clearFilters: () => void;
  getApiParams: () => {
    SearchTerm: string | null;
    Category: string | null;
    Incoterms: string[] | null;
    MinPrice: number | null;
    MaxPrice: number | null;
    Status: string | null;
    Condition: string | null;
    Grade: string | null;
    SortBy: string | null;
    SortDescending: boolean;
    PageNumber: number;
    PageSize: number;
    IncludeSpecifications: boolean;
    IncludeCertifications: boolean;
    IncludeAvailability: boolean;
  };
  // Expose debounced values for API queries
  debouncedSearchTerm: string;
  debouncedCategory: string;
}

const ProductFiltersContext = createContext<
  ProductFiltersContextType | undefined
>(undefined);

export function ProductFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: "",
    category: "all",
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      category: "all",
    });
  }, []);

  const getApiParams = useCallback(() => {
    return {
      SearchTerm: debouncedSearchTerm.trim() || null,
      Category: filters.category === "all" ? null : filters.category || null,
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
    };
  }, [debouncedSearchTerm, filters.category]);

  const value: ProductFiltersContextType = {
    filters,
    setSearchTerm,
    setCategory,
    clearFilters,
    getApiParams,
    debouncedSearchTerm,
    debouncedCategory: filters.category,
  };

  return (
    <ProductFiltersContext.Provider value={value}>
      {children}
    </ProductFiltersContext.Provider>
  );
}

export function useProductFilters(): ProductFiltersContextType {
  const context = useContext(ProductFiltersContext);
  if (context === undefined) {
    throw new Error(
      "useProductFilters must be used within a ProductFiltersProvider",
    );
  }
  return context;
}
