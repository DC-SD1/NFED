"use client";

import Image from "next/image";

import type { FarmLandItem } from "@/types/formal-grower.types";
import { ImageAssets } from "@/utils/image-assets";

export default function GrowerFarmCard({ farm }: { farm: FarmLandItem }) {
  return (
    <div className={"flex justify-between rounded-lg border px-5 py-6"}>
      <div>
        <p className={"font-bold"}>{farm.farmName}</p>
        <p className={"text-secondary-foreground text-sm"}>
          {farm.acreage} acres
        </p>
        <p className={"text-secondary-foreground text-sm"}>Current stage</p>
      </div>
      <Image
        src={ImageAssets.MAP_CONTAINER}
        alt={"map"}
        className={"size-20 object-contain"}
      />
    </div>
  );
}
