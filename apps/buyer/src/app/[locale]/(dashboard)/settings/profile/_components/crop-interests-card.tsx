"use client";

import { Button } from "@cf/ui";
import { IconEdit } from "@tabler/icons-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import CassavaImg from "@/assets/images/products/cassava.png";
import GingerImg from "@/assets/images/products/ginger.png";
import SoybeanImg from "@/assets/images/products/soya-beans.png";
import SweetPotatoImg from "@/assets/images/products/sweet-potatoes.png";

const PRODUCTS = [
  {
    id: "cassava",
    name: "Cassava",
    image: CassavaImg.src,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Bankye hemaa",
      },
      {
        title: "Incoterms",
        value: "EXW, FCA",
      },
      {
        title: "Price",
        value: "350",
      },
    ],
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    image: SweetPotatoImg.src,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Orange flesh",
      },
      {
        title: "Incoterms",
        value: "CIF, DDP",
      },
      {
        title: "Price",
        value: "300",
      },
    ],
  },
  {
    id: "ginger",
    name: "Ginger",
    image: GingerImg.src,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "Local",
      },
      {
        title: "Incoterms",
        value: "EXW, FCA",
      },
      {
        title: "Price",
        value: "450",
      },
    ],
  },
  {
    id: "soybean",
    name: "Soybean",
    image: SoybeanImg.src,
    category: "Roots and tubers",
    quantity: 30000,
    details: [
      {
        title: "Variety",
        value: "White",
      },
      {
        title: "Incoterms",
        value: "CIF, DAP",
      },
      {
        title: "Price",
        value: "600",
      },
    ],
  },
];

export function CropInterestsCard() {
  const t = useTranslations("settings.profile.buttons");

  return (
    <div className="h-[444px] w-full space-y-4 rounded-2xl border-[hsl(var(--border-light))] bg-[hsl(var(--background-light))] p-5 md:h-[268px] lg:border lg:bg-transparent">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold leading-[28px] md:text-[20px]">
          Crop interests
        </p>

        <Button
          variant="unstyled"
          className="h-[36px] w-[75px] bg-white p-0 text-sm font-bold leading-none text-[hsl(var(--text-dark))] md:bg-transparent"
        >
          <IconEdit className="size-4" />
          {t("edit")}
        </Button>
      </div>

      <div className="grid h-[176px] grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
        {PRODUCTS.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="flex h-[80px] items-center justify-between rounded-2xl bg-[#F5F5F5] p-4"
          >
            <div className="flex items-center gap-2">
              <div className="relative size-[48px] rounded-xl bg-[#F6FBFB]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p>{product.name}</p>
                <p className="text-sm text-[#586665]">{product.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
