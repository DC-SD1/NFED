"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { Button, cn } from "@cf/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewState } from "react-map-gl/mapbox";
import Map, { Layer, Popup, Source } from "react-map-gl/mapbox";

import type {
  FarmSoilResponse,
  SoilAcreData,
} from "@/lib/mock-data/farm-soil-data";
import { getBoundsFromGeometry } from "@/lib/utils/map-helpers";

interface SoilLevelMapProps {
  data: FarmSoilResponse;
  className?: string;
  mapboxAccessToken?: string;
  mapStyle?: string;
  initialViewState?: Partial<ViewState>;
  fitBounds?: boolean;
  boundsPadding?: { top: number; bottom: number; left: number; right: number };
  onAcreClick?: (acre: SoilAcreData) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Function to convert soil level (0-100) to color gradient (red to green)
function getSoilLevelColor(level: number): string {
  // Normalize to 0-1
  const normalized = level / 100;

  // Create gradient from red (0) to yellow (0.5) to green (1)
  let r, g;
  if (normalized < 0.5) {
    // Red to yellow
    r = 255;
    g = Math.round(normalized * 2 * 255);
  } else {
    // Yellow to green
    r = Math.round((1 - normalized) * 2 * 255);
    g = 255;
  }

  return `rgba(${r}, ${g}, 0, 0.6)`;
}

export default function SoilLevelMap({
  data,
  className,
  mapboxAccessToken = MAPBOX_TOKEN,
  mapStyle = "mapbox://styles/mapbox/satellite-v9",
  initialViewState,
  fitBounds = true,
  boundsPadding = { top: 100, bottom: 100, left: 100, right: 100 },
  onAcreClick,
}: SoilLevelMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedAcre, setSelectedAcre] = useState<SoilAcreData | null>(null);
  const [cursorStyle, setCursorStyle] = useState<string>("grab");

  // Convert acres data to GeoJSON FeatureCollection
  const geojsonData = {
    type: "FeatureCollection" as const,
    features: data.acres.map((acre) => ({
      type: "Feature" as const,
      properties: {
        id: acre.id,
        soilLevel: acre.soilLevel,
        productionRate: acre.productionRate,
        status: acre.status,
        color: getSoilLevelColor(acre.soilLevel),
      },
      geometry: acre.geometry,
    })),
  };

  // Auto-fit bounds once the map is ready
  useEffect(() => {
    if (fitBounds && loaded && mapRef.current && data.bounds) {
      mapRef.current.fitBounds(getBoundsFromGeometry(data.bounds), {
        padding: boundsPadding,
        duration: 800,
      });
    }
  }, [fitBounds, loaded, data.bounds, boundsPadding]);

  // Handle click on map
  const handleMapClick = useCallback(
    (event: any) => {
      const features = event.features;

      if (features && features.length > 0) {
        const clickedFeature = features[0];
        const acreId = clickedFeature.properties.id;

        // Find the corresponding acre data
        const acre = data.acres.find((a) => a.id === acreId);
        if (acre) {
          setSelectedAcre(acre);
          onAcreClick?.(acre);
        }
      }
    },
    [data.acres, onAcreClick],
  );

  // Handle mouse events for cursor
  const handleMouseEnter = useCallback(() => {
    setCursorStyle("pointer");
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCursorStyle("grab");
  }, []);

  // Calculate center from bounds
  const bounds = data.bounds;
  const coords = bounds?.coordinates?.[0];
  const centerLng =
    coords?.[0]?.[0] && coords?.[2]?.[0]
      ? (coords[0][0] + coords[2][0]) / 2
      : 0;
  const centerLat =
    coords?.[0]?.[1] && coords?.[2]?.[1]
      ? (coords[0][1] + coords[2][1]) / 2
      : 0;

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%", cursor: cursorStyle }}
        onLoad={() => setLoaded(true)}
        initialViewState={{
          longitude: centerLng,
          latitude: centerLat,
          zoom: 15,
          ...(initialViewState ?? {}),
        }}
        onClick={handleMapClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={["soil-polygons-fill"]}
      >
        <Source id="soil-data" type="geojson" data={geojsonData}>
          {/* Fill layer with data-driven styling */}
          <Layer
            id="soil-polygons-fill"
            type="fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": 0.7,
            }}
          />

          {/* Outline layer */}
          <Layer
            id="soil-polygons-line"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />

          {/* Labels layer */}
          <Layer
            id="soil-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "id"],
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-size": 14,
              "text-anchor": "center",
            }}
            paint={{
              "text-color": "#ffffff",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
            }}
          />
        </Source>

        {/* Popup for selected acre */}
        {selectedAcre && (
          <Popup
            longitude={selectedAcre.centroid[0]}
            latitude={selectedAcre.centroid[1]}
            anchor="bottom"
            onClose={() => setSelectedAcre(null)}
            closeButton={false}
            className="rounded-lg"
          >
            <div className="space-y-3 p-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">
                  Acre {selectedAcre.id}
                </h3>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <p>
                    Status:{" "}
                    <span
                      className={cn("font-medium", {
                        "text-green-600": selectedAcre.status === "high",
                        "text-yellow-600": selectedAcre.status === "medium",
                        "text-red-600": selectedAcre.status === "low",
                      })}
                    >
                      {selectedAcre.status.charAt(0).toUpperCase() +
                        selectedAcre.status.slice(1)}
                    </span>
                  </p>
                  <p>Soil Level: {selectedAcre.soilLevel}%</p>
                  <p>Production: {selectedAcre.productionRate} kg/h</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setSelectedAcre(null)}
              >
                Clear
              </Button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
        <h4 className="mb-2 text-xs font-semibold">Soil Level</h4>
        <div className="flex items-center space-x-2">
          <div className="flex h-4 w-20 overflow-hidden rounded">
            <div
              className="h-full w-1/3"
              style={{ backgroundColor: getSoilLevelColor(25) }}
            />
            <div
              className="h-full w-1/3"
              style={{ backgroundColor: getSoilLevelColor(50) }}
            />
            <div
              className="h-full w-1/3"
              style={{ backgroundColor: getSoilLevelColor(85) }}
            />
          </div>
          <div className="flex space-x-4 text-xs">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
