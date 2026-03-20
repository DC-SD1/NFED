"use client";
import { Button, cn } from "@cf/ui";
import { IconArrowRight, IconDotsVertical } from "@tabler/icons-react";
import Image from "next/image";

import CassavaImg from "@/assets/images/products/cassava.png";
import ChiliPepperImg from "@/assets/images/products/chili-pepper.png";
import SoybeanImg from "@/assets/images/products/soya-beans.png";

import { SectionCard } from "./SectionCard";

interface OrdersTilesProps {
  activeCount: number;
  continueCount: number;
  onActiveClick?: () => void;
  onContinueClick?: () => void;
  className?: string;
}

const sourcingProducts = [
  {
    id: "soybean",
    name: "Soybean",
    image: SoybeanImg,
    category: "Roots and tubers",
    stage: "Proforma invoice",
    step: 7,
  },
  {
    id: "chili-pepper",
    name: "Chili Pepper",
    image: ChiliPepperImg,
    category: "Roots and tubers",
    stage: "Document processing stage",
    step: 5,
  },
  {
    id: "cassava",
    name: "Cassava",
    image: CassavaImg,
    category: "Roots and tubers",
    stage: "Payment details",
    step: 3,
  },
];

export function OrdersTiles({
  activeCount,
  continueCount,
  onActiveClick,
  onContinueClick,
  className,
}: OrdersTilesProps) {
  return (
    <div className={className || "space-y-4"}>
      <SectionCard
        title="Active orders"
        count={activeCount}
        onActionClick={onActiveClick}
        actionAriaLabel="Active orders"
        defaultExpanded={false}
      >
        {sourcingProducts.map((product) => (
          <div
            className="flex h-[94px] items-center justify-between rounded-xl bg-white px-4"
            key={product.id}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex size-[62px] items-center justify-center rounded-xl bg-[#F5F5F5]"></div>
              <div>
                <p></p>
                <p className="text-sm text-[#586665]"></p>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#586665] md:text-sm">
            Showing 3 out of 5 items
          </p>
          <Button
            variant="link"
            className="text-primary size-auto p-0 text-xs md:text-sm"
          >
            See all orders <IconArrowRight className="!size-4 lg:!size-5" />
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Continue sourcing"
        count={continueCount}
        onActionClick={onContinueClick}
        actionAriaLabel="Continue sourcing"
        defaultExpanded={false}
      >
        {sourcingProducts.map((product) => (
          <div
            className="flex h-[94px] items-center justify-between rounded-xl bg-white px-4"
            key={product.id}
          >
            <div className="hidden items-center gap-4 md:flex">
              <div className="relative flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl bg-[#F5F5F5] lg:size-[62px]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-sm lg:text-base"> {product.name} </p>
                <p className="text-xs text-[#586665] lg:text-sm">
                  {" "}
                  {product.category}{" "}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between md:hidden">
              <div className="flex items-center gap-4">
                <div className="relative flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl bg-[#F5F5F5] lg:size-[62px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm md:text-base"> {product.name} </p>
                  <p className="text-xs text-[#586665] lg:text-sm">
                    {" "}
                    {product.category}{" "}
                  </p>

                  <p className="text-primary mt-2 block text-xs md:hidden">
                    {product.stage}
                  </p>
                </div>
              </div>

              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-xl bg-[#F5F5F5] md:hidden">
                <IconDotsVertical className="size-4" />
              </div>
            </div>

            <div className="hidden items-end gap-10 md:flex">
              <div className="h-auto w-[280px] space-y-2 lg:h-[54px] lg:w-[482px]">
                <p className="text-sm lg:text-base">{product.stage}</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-[8px] w-[28px] rounded-full bg-[#DDE4E4] lg:w-[46px]",
                        {
                          "bg-primary": index < product.step,
                        },
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex h-[48px] w-[104px] items-center gap-2 lg:w-[161px]">
                <Button className="hidden h-full w-[102px] rounded-xl lg:block">
                  Continue
                </Button>
                <Button className="flex h-full w-[48px] rounded-xl lg:hidden">
                  <IconArrowRight className="size-4" />
                </Button>
                <Button
                  className="h-full w-[48px] rounded-xl bg-[#F5F5F5] hover:bg-[#F5F5F5]"
                  variant="ghost"
                >
                  <IconDotsVertical className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#586665] md:text-sm">
            Showing 3 out of 5 items
          </p>
          <Button
            variant="link"
            className="text-primary size-auto p-0 text-xs md:text-sm"
          >
            See all sourcing <IconArrowRight className="!size-4 lg:!size-5" />
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
