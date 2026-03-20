"use client";

import { useRouter } from "@bprogress/next/app";
import { useParams } from "next/navigation";

import { useSourcingStore } from "@/lib/stores/sourcing-store";

import {
  ProductCertifications,
  ProductDetailsCard,
  ProductSpecifications,
  QuantityCard,
} from ".";

/**
 * ProductSidebar component - Right sidebar containing product information and interaction elements.
 *
 * This component serves as the main interaction panel for the product details page,
 * containing several key sections:
 *
 * - **Product Details Card**: Displays product name, category, and key specifications
 * - **Quantity Card**: Interactive quantity selector with validation and sourcing functionality
 * - **Product Specifications**: Technical specifications and quality requirements
 * - **Certifications**: Product certifications and compliance information
 *
 * The component is designed to provide a comprehensive overview of product information
 * while enabling user interaction through the quantity selection and sourcing workflow.
 *
 * @example
 * ```tsx
 * <ProductSidebar />
 * ```
 *
 * @returns JSX element containing the complete product sidebar with all information sections
 */
export function ProductSidebar() {
  const router = useRouter();
  const { locale } = useParams();
  const localeStr = Array.isArray(locale) ? locale[0] : String(locale ?? "");

  const { reset, setAvailableQuantity, saveAvailableCropSpecification } =
    useSourcingStore();

  return (
    <div className="w-full space-y-6 lg:w-[423px]">
      <ProductDetailsCard
        productName="Cassava"
        productCategory="Roots and tubers"
        className="hidden h-[490px] md:h-[530px] lg:block"
        details={[
          { label: "Variety", value: "Legin-18", id: "variety" },
          { label: "Origin", value: "Ghana", id: "origin" },
          { label: "Harvest Year", value: "2024", id: "harvest-year" },
          { label: "Grade", value: "Premium", id: "grade" },
          { label: "Certification", value: "Organic", id: "certification" },
        ]}
      />

      <QuantityCard
        maxQuantity={30000}
        // TODO: Quantitiy is not being used.
        onBeginSourcing={(quantity) => {
          // NOTE: Reset store before starting a new sourcing flow
          reset();

          // TODO: Fetch order details and prefill store (not implemented)
          // await api.order.get(orderId)
          //       .then((order) => hydrate store with order-specific state)
          //       .catch(() => {/* handle error */});

          // TODO: Fetch product details and set available quantity (not implemented)
          // const product = await api.products.get(productId)
          // setAvailableQuantity(product.availableQuantity)

          // For now, set a dummy available quantity
          setAvailableQuantity(30000);
          saveAvailableCropSpecification({
            quantity,
            cropVariety: "",
            cultivationType: "",
            grade: "",
            processingStyle: "",
            packagingStyle: "",
            certificationType: "",
            testingType: "",
          });

          router.push(
            `/${localeStr}/sourcing/available-crops/crop-specification`,
          );
        }}
      />

      <ProductSpecifications
        title="Other specification"
        className="hidden h-[320px] md:h-[340px] lg:block"
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
        className="hidden h-[265px] md:h-[284px] lg:block"
        items={[
          { content: "Non-GMO" },
          { content: "Certificate of origin" },
          { content: "Total Aflatoxins(20 pp max) Certificate of origin" },
        ]}
      />
    </div>
  );
}
