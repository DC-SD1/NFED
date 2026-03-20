import type { Metadata } from "next";

import SoilGradientMapDemo from "@/components/map/soil-gradient-map-demo";

export const metadata: Metadata = {
  title: "Soil Gradient Map Demo",
  description:
    "Demo page for gradient polygon map with soil level visualization",
};

export default function SoilGradientMapDemoPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Soil Gradient Map Demo</h1>
        <p className="text-muted-foreground">
          Interactive farm visualization showing soil levels with smooth
          gradient across the entire polygon
        </p>
      </div>

      <SoilGradientMapDemo />
    </div>
  );
}
