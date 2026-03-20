import ProductDetails from "./_components/product-details-client";

export default function ProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ProductDetails params={params} />;
}
