import CassavaImg from "@/assets/images/products/cassava.png";
import { logger } from "@/lib/utils/logger";

import {
  ProductCertifications,
  ProductDescription,
  ProductDetailsCard,
  ProductImageSlider,
  ProductSpecifications,
  ProductThumbnailGallery,
  ProductVarietiesCarousel,
  RecommendedProductsCarousel,
} from ".";

/**
 * ProductDetails component - Main product display section with images, description, and related products.
 *
 * This component displays the primary product information including:
 * - Large product image with navigation controls
 * - Image gallery with thumbnail previews
 * - Product description and details
 * - Related product recommendations
 * - Product variety suggestions
 *
 * The component is designed to provide a comprehensive view of the product
 * with interactive elements for image navigation and product exploration.
 *
 * @example
 * ```tsx
 * <ProductDetails />
 * ```
 *
 * @returns JSX element containing the complete product details display
 */
export function ProductDetails() {
  // Sample product images - in a real app, this would come from props or API
  const productImages = [
    { src: CassavaImg, alt: "Cassava - Main view", id: "cassava-main" },
    { src: CassavaImg, alt: "Cassava - Side view", id: "cassava-side" },
    { src: CassavaImg, alt: "Cassava - Close up", id: "cassava-close" },
    { src: CassavaImg, alt: "Cassava - Harvest view", id: "cassava-harvest" },
    { src: CassavaImg, alt: "Cassava - Processing", id: "cassava-processing" },
    { src: CassavaImg, alt: "Cassava - Quality check", id: "cassava-quality" },
    { src: CassavaImg, alt: "Cassava - Packaging", id: "cassava-packaging" },
    { src: CassavaImg, alt: "Cassava - Storage", id: "cassava-storage" },
    { src: CassavaImg, alt: "Cassava - Final product", id: "cassava-final" },
  ];

  const handleAddToPlan = () => {
    logger.info("Added to plan");
    // Add your plan logic here
  };

  const handleImageChange = (currentIndex: number) => {
    logger.info("Current image index:", { currentIndex });
    // Add any image change logic here
  };

  const handleThumbnailClick = (index: number, thumbnail: any) => {
    logger.info("Thumbnail clicked:", { index, thumbnail });
    // This would typically update the main image slider to show the selected image
    // For now, we'll just log the selection
  };

  // Sample product data for carousels
  const productVarieties = [
    {
      id: "cassava-variety-1",
      image: CassavaImg,
      name: "Cassava",
      category: "Roots and tubers",
      quantity: 30000,
      details: [
        { title: "Variety", value: "Bankye hemaa" },
        { title: "Incoterms", value: "EXW, FCA" },
        { title: "Price", value: "350" },
      ],
    },
    {
      id: "cassava-variety-2",
      image: CassavaImg,
      name: "Cassava",
      category: "Roots and tubers",
      quantity: 30000,
      details: [
        { title: "Variety", value: "Bankye hemaa" },
        { title: "Incoterms", value: "EXW, FCA" },
        { title: "Price", value: "350" },
      ],
    },
    {
      id: "cassava-variety-3",
      image: CassavaImg,
      name: "Cassava",
      category: "Roots and tubers",
      quantity: 30000,
      details: [
        { title: "Variety", value: "Bankye hemaa" },
        { title: "Incoterms", value: "EXW, FCA" },
        { title: "Price", value: "350" },
      ],
    },
    {
      id: "cassava-variety-4",
      image: CassavaImg,
      name: "Cassava",
      category: "Roots and tubers",
      quantity: 30000,
      details: [
        { title: "Variety", value: "Bankye hemaa" },
        { title: "Incoterms", value: "EXW, FCA" },
        { title: "Price", value: "350" },
      ],
    },
  ];

  const handleProductClick = (product: any, index: number) => {
    logger.info("Product clicked:", { product, index });
    // Add your product click logic here
  };

  return (
    <div className="w-full max-w-[873px] space-y-6 overflow-hidden">
      <ProductImageSlider
        images={productImages}
        onAddToPlan={handleAddToPlan}
        onImageChange={handleImageChange}
      />

      <ProductThumbnailGallery
        thumbnails={productImages}
        selectedIndex={0}
        onThumbnailClick={handleThumbnailClick}
      />

      <ProductDetailsCard
        productName="Cassava"
        productCategory="Roots and tubers"
        className="block h-[490px] md:h-[530px] lg:hidden"
        details={[
          { label: "Variety", value: "Legin-18", id: "variety" },
          { label: "Origin", value: "Ghana", id: "origin" },
          { label: "Harvest Year", value: "2024", id: "harvest-year" },
          { label: "Grade", value: "Premium", id: "grade" },
          { label: "Certification", value: "Organic", id: "certification" },
        ]}
      />

      <ProductSpecifications
        title="Other specification"
        className="block h-[320px] md:h-[340px] lg:hidden"
        items={[
          { content: "Moisture 12.5 % Max" },
          {
            content:
              "Total defective grains(mouldy, shrivelled, damaged grains) 5% max",
          },
          { content: "Total Aflatoxins(20 pp max)" },
          { content: "Live insects - Absent" },
        ]}
      />

      <ProductCertifications
        title="Certifications"
        className="block h-[265px] md:h-[284px] lg:hidden"
        items={[
          { content: "Non-GMO" },
          { content: "Certificate of origin" },
          { content: "Total Aflatoxins(20 pp max) Certificate of origin" },
        ]}
      />

      <ProductDescription />

      <div className="space-y-6">
        <ProductVarietiesCarousel
          products={productVarieties}
          onProductClick={handleProductClick}
        />

        <RecommendedProductsCarousel
          products={productVarieties}
          onProductClick={handleProductClick}
        />
      </div>
    </div>
  );
}
