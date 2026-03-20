"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { cn } from "@cf/ui";
import * as mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapRef, ViewState } from "react-map-gl/mapbox";
import Map, { Layer, Source } from "react-map-gl/mapbox";

import type { GeoFeature } from "@/lib/utils/map-helpers";
import {
  getBoundsFromGeoJson,
  getCenterFromGeoJson,
} from "@/lib/utils/map-helpers";

interface PolygonMapProps {
  data: GeoFeature; // GeoJSON feature to render
  className?: string; // Tailwind / custom classes for size & positioning
  mapboxAccessToken?: string; // defaults to env var
  mapStyle?: string; // defaults to satellite style
  initialViewState?: Partial<ViewState>; // override the auto-computed view state
  fitBounds?: boolean; // auto-fit to polygon on load
  boundsPadding?: { top: number; bottom: number; left: number; right: number };
  fillColor?: string; // polygon fill
  lineColor?: string; // polygon stroke
  lineWidth?: number; // polygon stroke width
  mapZoom?: boolean; // enable zoom controls with buttons
  // positioning props for zoom controls
  zoomControlsPosition?: {
    bottom?: string;
    right?: string;
    top?: string;
    left?: string;
  };
  // Central label props
  showCenterLabel?: boolean;
  centerLabelText?: string;
  labelStyle?: {
    textColor?: string;
    backgroundColor?: string;
    backgroundWidth?: number;
    textSize?: number;
  };
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function PolygonMap({
  data,
  className,
  mapboxAccessToken = MAPBOX_TOKEN,
  mapStyle = "mapbox://styles/mapbox/satellite-v9",
  initialViewState,
  fitBounds = true,
  boundsPadding = { top: 100, bottom: 100, left: 100, right: 100 },
  fillColor = "rgba(0, 230, 10, 0.24)",
  lineColor = "#60E052",
  lineWidth = 2.5,
  mapZoom = false,
  zoomControlsPosition = { bottom: "1rem", right: "1rem" },
  showCenterLabel = false,
  centerLabelText = "",
  labelStyle = {
    textColor: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backgroundWidth: 3,
    textSize: 16,
  },
}: PolygonMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const mapboxControlPosition = useMemo<mapboxgl.ControlPosition>(() => {
    // Map our positioning props to Mapbox control anchors
    if (zoomControlsPosition.top) {
      return zoomControlsPosition.right ? "top-right" : "top-left";
    }
    if (zoomControlsPosition.bottom) {
      return zoomControlsPosition.right ? "bottom-right" : "bottom-left";
    }
    return "top-right";
  }, [zoomControlsPosition]);

  // Add Mapbox NavigationControl when mapZoom is enabled
  useEffect(() => {
    if (!mapZoom || !loaded || !mapRef.current) return;
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true,
    });
    const map = mapRef.current.getMap();
    try {
      map.addControl(nav, mapboxControlPosition);
    } catch {
      // ignore if already added
    }
    return () => {
      try {
        map.removeControl(nav);
      } catch {
        // ignore
      }
    };
  }, [mapZoom, loaded, mapboxControlPosition]);

  /* Auto-fit bounds once the map is ready */
  useEffect(() => {
    if (fitBounds && loaded && mapRef.current) {
      mapRef.current.fitBounds(getBoundsFromGeoJson(data.geometry), {
        padding: boundsPadding,
        duration: 800,
      });
    }
  }, [fitBounds, loaded, data.geometry, boundsPadding]);

  const center = getCenterFromGeoJson(data);

  // Manual zoom handlers retained for potential future use
  const _handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 });
    }
  };

  const _handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 });
    }
  };

  // Build dynamic style object for zoom controls positioning
  const _zoomControlsStyle = {
    ...(zoomControlsPosition.bottom && { bottom: zoomControlsPosition.bottom }),
    ...(zoomControlsPosition.right && { right: zoomControlsPosition.right }),
    ...(zoomControlsPosition.top && { top: zoomControlsPosition.top }),
    ...(zoomControlsPosition.left && { left: zoomControlsPosition.left }),
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        onLoad={() => setLoaded(true)}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: 15,
          ...(initialViewState ?? {}),
        }}
      >
        <Source id="polygon" type="geojson" data={data}>
          <Layer
            id="polygon-fill"
            type="fill"
            paint={{ "fill-color": fillColor }}
          />
          <Layer
            id="polygon-line"
            type="line"
            paint={{ "line-color": lineColor, "line-width": lineWidth }}
          />
        </Source>

        {/* Central label */}
        {showCenterLabel && centerLabelText && (
          <Source
            id="center-label"
            type="geojson"
            data={{
              type: "Feature",
              properties: { label: centerLabelText },
              geometry: {
                type: "Point",
                coordinates: center,
              },
            }}
          >
            <Layer
              id="center-label-layer"
              type="symbol"
              layout={{
                "text-field": ["get", "label"],
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                "text-size": labelStyle?.textSize ?? 16,
                "text-anchor": "center",
              }}
              paint={{
                "text-color": labelStyle?.textColor ?? "#FFFFFF",
                "text-halo-color":
                  labelStyle?.backgroundColor ?? "rgba(0, 0, 0, 0.8)",
                "text-halo-width": labelStyle?.backgroundWidth ?? 3,
                "text-halo-blur": 0.5,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Mapbox zoom controls are injected via addControl when mapZoom is true */}
    </div>
  );
}
