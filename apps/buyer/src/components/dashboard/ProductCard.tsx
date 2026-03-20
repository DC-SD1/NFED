"use client";
import { Button, cn } from "@cf/ui";
import { IconPlant2 } from "@tabler/icons-react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

export interface ProductDetail {
  title: string;
  value: string | string[];
}

export interface ProductItem {
  id: string;
  name: string;
  image: StaticImageData | string;
  category: string;
  quantity: number;
  details: ProductDetail[];
}

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div
      className={cn(
        "h-[471px] overflow-hidden rounded-xl border border-[hsl(var(--border-light))] shadow-md",
        className,
      )}
    >
      <div className="h-[207px] bg-[#f5f5f5]">
        <div className="relative size-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-[#6F7978] p-2 text-white">
            <IconPlant2 className="size-4" />
            <p className="text-sm">{product.quantity.toLocaleString()}</p>
            <p className="text-sm">MT Available</p>
          </div>
        </div>
      </div>

      <div className="h-[248px] space-y-6 p-4">
        <div className="space-y-0">
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <p className="text-sm">{product.category}</p>
        </div>

        <div className="flex flex-col gap-5">
          {product.details.map((detail, index) => (
            <div key={index} className="flex items-center justify-between">
              <p className="text-sm text-[#586665]">{detail.title}</p>
              <p className="text-sm">{detail.value}</p>
            </div>
          ))}
        </div>

        <Button className="h-[36px] w-full rounded-xl" asChild>
          <Link href={`/products/${product.id}`}>View details</Link>
        </Button>
      </div>
    </div>
  );
}
