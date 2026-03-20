"use client";

import { cn } from "@cf/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GeoFeature } from "@/lib/utils/map-helpers";
import { getCenterFromGeoJson } from "@/lib/utils/map-helpers";

import {
  acquireLiveSlot,
  getGateStatus,
  type ReleaseFn,
} from "./map-concurrency";
import PolygonMap from "./polygon-map";

interface LiveOrStaticProps {
  data: GeoFeature;
  className?: string;
  boundsPadding?: { top: number; bottom: number; left: number; right: number };
  staticZoom?: number;
}

export default function LiveOrStaticMap({
  data,
  className,
  boundsPadding,
  staticZoom = 14,
}: LiveOrStaticProps) {
  const [hasSlot, setHasSlot] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const releaseRef = useRef<ReleaseFn | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const acquiringRef = useRef(false);

  const center = useMemo(() => getCenterFromGeoJson(data), [data]);
  const farmName = data.properties?.farmName || "Unknown";
  const farmId = data.properties?.farmId || "unknown";

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
  const staticUrl = token
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${center[0]},${center[1]},${staticZoom},0/400x400@2x?access_token=${token}`
    : "";

  // Release slot
  const releaseSlot = useCallback(() => {
    if (releaseRef.current) {
      const status = getGateStatus();
      console.log(
        `[LiveOrStatic] ${farmName} releasing slot. Before: ${status.active}/${status.max}`,
      );
      const r = releaseRef.current;
      releaseRef.current = null;
      setHasSlot(false);
      r();
    }
  }, [farmName]);

  // Set up intersection observer directly
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        setIsVisible(visible);

        if (!visible) {
          // Release immediately when going out of view
          releaseSlot();
        }
      },
      {
        root: null,
        rootMargin: "50px", // Small margin for responsive detection
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [releaseSlot]);

  // Handle visibility changes to acquire/release slots
  useEffect(() => {
    let mounted = true;

    const tryAcquire = async () => {
      if (!mounted || acquiringRef.current || releaseRef.current || hasSlot)
        return;

      acquiringRef.current = true;
      const status = getGateStatus();
      console.log(
        `[LiveOrStatic] ${farmName} trying to acquire. Current: ${status.active}/${status.max}, Queue: ${status.queued}`,
      );

      try {
        const release = await acquireLiveSlot();

        if (!mounted) {
          release();
          return;
        }

        console.log(`[LiveOrStatic] ${farmName} acquired slot successfully`);
        releaseRef.current = release;
        setHasSlot(true);
      } catch (error) {
        console.error(`[LiveOrStatic] ${farmName} failed to acquire:`, error);
      } finally {
        acquiringRef.current = false;
      }
    };

    if (isVisible && !hasSlot && !releaseRef.current) {
      void tryAcquire();
    } else if (!isVisible) {
      releaseSlot();
    }

    return () => {
      mounted = false;
    };
  }, [isVisible, hasSlot, farmName, releaseSlot]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseSlot();
    };
  }, [releaseSlot]);

  const showLive = hasSlot && isVisible;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-xl", className)}
      data-farm-id={farmId}
    >
      {showLive ? (
        <PolygonMap
          data={data}
          className="size-full"
          boundsPadding={boundsPadding}
        />
      ) : (
        <img
          src={staticUrl}
          alt={`Map preview for ${farmName}`}
          className="size-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
