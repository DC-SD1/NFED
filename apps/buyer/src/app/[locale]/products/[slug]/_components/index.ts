/**
 * Components index file for product details page
 *
 * This file exports all components used in the product details page,
 * providing a centralized import location for better organization
 * and easier maintenance.
 */

// Main layout components
export { ProductDetails } from "./product-details";
export { default as ProductDetailsClient } from "./product-details-client";
export { ProductNav } from "./product-nav";
export { ProductSidebar } from "./product-sidebar";

// Product information components
export { ProductDescription } from "./product-description";
export {
  ProductDetailsCard,
  ProductInfoCard,
  ProductSpecsCard,
} from "./product-details-card";

// Image and gallery components
export { GalleryPreview } from "./gallery-preview";
export { ImageSlider, ProductImageSlider } from "./image-slider";
export { ProductThumbnailGallery, ThumbnailGallery } from "./thumbnail-gallery";

// Product carousel components
export {
  ProductCarousel,
  ProductVarietiesCarousel,
  RecommendedProductsCarousel,
} from "./product-carousel";

// Information display components
export {
  InfoList,
  ProductCertifications,
  ProductSpecifications,
} from "./info-list";

// Quantity and interaction components
export { QuantityCard } from "./quantity-card";
export { QuantitySelector } from "./quantity-selector";

// Type exports for better TypeScript support
export type { ImageItem, ImageSliderProps } from "./image-slider";
export type { InfoListItem, InfoListProps } from "./info-list";
export type {
  ProductCarouselItem,
  ProductCarouselProps,
} from "./product-carousel";
export type {
  ProductDetailItem,
  ProductDetailsCardProps,
} from "./product-details-card";
export type { QuantityCardProps } from "./quantity-card";
export type { QuantitySelectorProps } from "./quantity-selector";
export type { ThumbnailGalleryProps, ThumbnailItem } from "./thumbnail-gallery";
