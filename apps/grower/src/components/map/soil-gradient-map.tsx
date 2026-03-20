"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { cn } from "@cf/ui";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapMouseEvent, MapRef, ViewState } from "react-map-gl/mapbox";
import Map, { Layer, Source } from "react-map-gl/mapbox";

import type { GeoFeature } from "@/lib/utils/map-helpers";
import {
  getBoundsFromGeometry,
  getCenterFromGeoJson,
  getCenterFromGeometry,
} from "@/lib/utils/map-helpers";
import type { FarmSoilResponse, SoilAcreData } from "@/types/soil-gradient";

interface SoilGradientMapProps {
  data: FarmSoilResponse;
  originalGeoFeature?: GeoFeature; // Pass original data for accurate centroid
  className?: string;
  mapboxAccessToken?: string;
  mapStyle?: string;
  initialViewState?: Partial<ViewState>;
  fitBounds?: boolean;
  showLabels?: boolean;
  boundsPadding?: { top: number; bottom: number; left: number; right: number };
  onAcreClick?: (acre: SoilAcreData | null) => void;
  mapZoom?: boolean; // enable zoom controls with buttons
  // positioning props for zoom controls
  zoomControlsPosition?: {
    bottom?: string;
    right?: string;
    top?: string;
    left?: string;
  };
  // Label customization props
  showAcreLabels?: boolean;
  labelClassName?: string; // For custom label styling
  labelStyle?: {
    textColor?: string;
    backgroundColor?: string;
    backgroundWidth?: number;
    textSize?: number | [string, ...any[]]; // number or Mapbox expression
  };
  // Center label props (like polygon-map)
  showCenterLabel?: boolean;
  centerLabelText?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// Helper function to interpolate color based on soil level
// Helper function to interpolate color based on soil level
function getSoilLevelColor(level: number): string {
  // Normalize to 0-1
  const normalized = Math.max(0, Math.min(1, level / 100));

  let r, g, b;
  if (normalized < 0.5) {
    // Deep Red to Bright Red (0-50)
    const t = normalized / 0.5;
    r = Math.round(180 + (255 - 180) * t); // 180 to 255
    g = Math.round(0 + 50 * t); // 0 to 50
    b = Math.round(0 + 20 * t); // 0 to 20
  } else if (normalized < 0.75) {
    // Orange to Yellow (50-75)
    const t = (normalized - 0.5) / 0.25;
    r = 255;
    g = Math.round(160 + (220 - 160) * t); // 160 to 220
    b = Math.round(10 - 10 * t); // 10 to 0
  } else {
    // Yellow to Bright Green (75-100)
    const t = (normalized - 0.75) / 0.25;
    r = Math.round(255 * (1 - t)); // 255 to 0
    g = Math.round(220 + 35 * t); // 220 to 255
    b = 0;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Check if a point is inside a polygon
function pointInPolygon(point: [number, number], polygon: number[][]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]?.[0];
    const yi = polygon[i]?.[1];
    const xj = polygon[j]?.[0];
    const yj = polygon[j]?.[1];

    const intersect =
      yi &&
      yj &&
      xi &&
      xj &&
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// eslint-disable-next-line max-lines-per-function
export default function SoilGradientMap({
  data,
  originalGeoFeature,
  className,
  mapboxAccessToken = MAPBOX_TOKEN,
  mapStyle = "mapbox://styles/mapbox/satellite-v9",
  initialViewState,
  fitBounds = true,
  showLabels = false,
  boundsPadding = { top: 100, bottom: 100, left: 100, right: 100 },
  mapZoom = false,
  zoomControlsPosition = { bottom: "1rem", right: "1rem" },
  onAcreClick,
  showAcreLabels = false,
  labelClassName: _labelClassName,
  labelStyle = {
    textColor: "#FFFFFF",
    backgroundColor: "#000000",
    backgroundWidth: 2,
    textSize: 12,
  },
  showCenterLabel = false,
  centerLabelText = "",
}: SoilGradientMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<[number, number] | null>(
    null,
  );
  const [clickedAcre, setClickedAcre] = useState<SoilAcreData | null>(null);
  const [popupPosition, setPopupPosition] = useState<[number, number] | null>(
    null,
  );
  const [popupPixelPosition, setPopupPixelPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Create a mesh of small polygons for gradient effect
  const gradientMesh = useMemo(() => {
    const bounds = data.bounds.coordinates[0];
    if (!bounds) return null;

    const minLng = Math.min(...bounds.map((coord) => coord[0] ?? 0));
    const maxLng = Math.max(...bounds.map((coord) => coord[0] ?? 0));
    const minLat = Math.min(...bounds.map((coord) => coord[1] ?? 0));
    const maxLat = Math.max(...bounds.map((coord) => coord[1] ?? 0));

    const features: any[] = [];
    const resolution = 100; // Higher resolution for smoother gradient
    const cellWidth = (maxLng - minLng) / resolution;
    const cellHeight = (maxLat - minLat) / resolution;

    // Helper to check if all corners of a cell are inside the polygon
    const isCellFullyInside = (lng: number, lat: number): boolean => {
      const corners: [number, number][] = [
        [lng, lat],
        [lng + cellWidth, lat],
        [lng + cellWidth, lat + cellHeight],
        [lng, lat + cellHeight],
      ];
      return corners.every((corner) => pointInPolygon(corner, bounds));
    };

    // Helper to check if any corner of a cell is inside the polygon
    const isCellPartiallyInside = (lng: number, lat: number): boolean => {
      const corners: [number, number][] = [
        [lng, lat],
        [lng + cellWidth, lat],
        [lng + cellWidth, lat + cellHeight],
        [lng, lat + cellHeight],
      ];
      return corners.some((corner) => pointInPolygon(corner, bounds));
    };

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const lng = minLng + i * cellWidth;
        const lat = minLat + j * cellHeight;
        const centerPoint: [number, number] = [
          lng + cellWidth / 2,
          lat + cellHeight / 2,
        ];

        // Skip cells that are completely outside
        if (!isCellPartiallyInside(lng, lat)) continue;

        // For cells on the boundary, only include if center is inside
        if (
          !isCellFullyInside(lng, lat) &&
          !pointInPolygon(centerPoint, bounds)
        )
          continue;

        // Calculate soil level based on nearby acres (inverse distance weighting)
        let totalWeight = 0;
        let weightedSoilLevel = 0;
        let nearestAcre = data.acres[0];
        let minDistance = Infinity;

        data.acres.forEach((acre) => {
          const distance = Math.sqrt(
            Math.pow(centerPoint[0] - acre.centroid[0], 2) +
              Math.pow(centerPoint[1] - acre.centroid[1], 2),
          );

          // Track nearest acre for this cell
          if (distance < minDistance) {
            minDistance = distance;
            nearestAcre = acre;
          }

          const weight = 1 / (distance + 0.00001); // Smaller epsilon for smoother interpolation
          totalWeight += weight;
          weightedSoilLevel += acre.soilLevel * weight;
        });

        const soilLevel = weightedSoilLevel / totalWeight;
        const color = getSoilLevelColor(soilLevel);

        // Create small polygon cell with nearest acre reference
        features.push({
          type: "Feature",
          properties: {
            soilLevel,
            color,
            // Add nearest acre data for click detection
            nearestAcreId: nearestAcre?.id,
            nearestAcreStatus: nearestAcre?.status,
            nearestAcreProductionRate: nearestAcre?.productionRate,
            nearestAcreSoilLevel: nearestAcre?.soilLevel,
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [lng, lat],
                [lng + cellWidth, lat],
                [lng + cellWidth, lat + cellHeight],
                [lng, lat + cellHeight],
                [lng, lat],
              ],
            ],
          },
        });
      }
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [data]);

  // Farm boundary as single polygon
  const farmBoundary = {
    type: "Feature" as const,
    properties: {},
    geometry: data.bounds,
  };

  // Create a GeoJSON for acre central labels
  const acreLabels = useMemo(() => {
    if (!showAcreLabels) return null;

    return {
      type: "FeatureCollection" as const,
      features: data.acres.map((acre) => ({
        type: "Feature" as const,
        properties: {
          id: acre.id,
          soilLevel: acre.soilLevel,
          status: acre.status,
        },
        geometry: {
          type: "Point" as const,
          coordinates: acre.centroid,
        },
      })),
    };
  }, [data.acres, showAcreLabels]);

  // Create invisible acre boundaries for click detection
  const acreBoundaries = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: data.acres.map((acre) => ({
        type: "Feature" as const,
        properties: {
          id: acre.id,
          soilLevel: acre.soilLevel,
          productionRate: acre.productionRate,
          status: acre.status,
        },
        geometry: acre.geometry,
      })),
    };
  }, [data.acres]);

  // Calculate farm center for center label
  const farmCenter = useMemo(() => {
    // Use originalGeoFeature if available for more accurate centroid
    if (originalGeoFeature) {
      return getCenterFromGeoJson(originalGeoFeature);
    }
    // Fallback to bounds geometry
    return getCenterFromGeometry(data.bounds);
  }, [data.bounds, originalGeoFeature]);

  // Auto-fit bounds once the map is ready
  useEffect(() => {
    if (fitBounds && loaded && mapRef.current) {
      mapRef.current.fitBounds(getBoundsFromGeometry(data.bounds), {
        padding: boundsPadding,
        duration: 800,
      });
    }
  }, [fitBounds, loaded, data.bounds, boundsPadding]);

  // Calculate intelligent popup position based on available space
  const calculatePopupPosition = useCallback(
    (markerPixelPosition: { x: number; y: number }) => {
      if (!mapRef.current) return markerPixelPosition;

      const mapContainer = mapRef.current.getContainer();
      const mapWidth = mapContainer.offsetWidth;
      const mapHeight = mapContainer.offsetHeight;

      const popupWidth = 140; // min-w-[140px]
      const popupHeight = 80; // approximate height
      const offset = 60; // distance from marker

      const { x: markerX, y: markerY } = markerPixelPosition;

      // Calculate available space in each direction
      const spaceTop = markerY;
      const spaceBottom = mapHeight - markerY;
      const spaceLeft = markerX;
      const spaceRight = mapWidth - markerX;

      // Determine best position based on available space
      let popupX = markerX;
      let popupY = markerY;

      // Priority: top, right, bottom, left
      if (spaceTop >= popupHeight + offset) {
        // Position above
        popupX = markerX;
        popupY = markerY - offset;
      } else if (spaceRight >= popupWidth + offset) {
        // Position to the right
        popupX = markerX + offset;
        popupY = Math.max(
          popupHeight / 2,
          Math.min(markerY, mapHeight - popupHeight / 2),
        );
      } else if (spaceBottom >= popupHeight + offset) {
        // Position below
        popupX = markerX;
        popupY = markerY + offset;
      } else if (spaceLeft >= popupWidth + offset) {
        // Position to the left
        popupX = markerX - offset;
        popupY = Math.max(
          popupHeight / 2,
          Math.min(markerY, mapHeight - popupHeight / 2),
        );
      } else {
        // Fallback: position in the largest available space
        const maxSpace = Math.max(spaceTop, spaceRight, spaceBottom, spaceLeft);
        if (maxSpace === spaceTop) {
          popupX = markerX;
          popupY = markerY - Math.min(offset, spaceTop - popupHeight - 10);
        } else if (maxSpace === spaceRight) {
          popupX = markerX + Math.min(offset, spaceRight - popupWidth - 10);
          popupY = markerY;
        } else if (maxSpace === spaceBottom) {
          popupX = markerX;
          popupY = markerY + Math.min(offset, spaceBottom - popupHeight - 10);
        } else {
          popupX = markerX - Math.min(offset, spaceLeft - popupWidth - 10);
          popupY = markerY;
        }
      }

      // Ensure popup stays within bounds
      popupX = Math.max(
        popupWidth / 2,
        Math.min(popupX, mapWidth - popupWidth / 2),
      );
      popupY = Math.max(
        popupHeight / 2,
        Math.min(popupY, mapHeight - popupHeight / 2),
      );

      return { x: popupX, y: popupY };
    },
    [],
  );

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const coordinates: [number, number] = [
        event.lngLat.lng,
        event.lngLat.lat,
      ];

      // Use Mapbox's built-in feature querying for better performance
      if (event.features && event.features.length > 0) {
        const feature = event.features[0];

        // Check if this is an acre boundary feature
        if (feature?.properties && feature.source === "acre-boundaries") {
          const clickedAcre = data.acres.find(
            (acre) => acre.id === feature.properties?.id,
          );

          if (clickedAcre) {
            setClickedAcre(clickedAcre);
            setPopupPosition(coordinates);
            // Get pixel position for marker
            const markerPoint = mapRef.current?.project(coordinates);
            if (markerPoint) {
              // Calculate intelligent popup position
              const popupPoint = calculatePopupPosition(markerPoint);
              setPopupPixelPosition(popupPoint);
            }
            onAcreClick?.(clickedAcre);
            return;
          }
        }

        // Check if this is a gradient mesh cell - use nearest acre data
        if (feature?.properties && feature.source === "gradient-mesh") {
          const nearestAcreId = feature.properties.nearestAcreId;
          if (nearestAcreId) {
            const clickedAcre = data.acres.find(
              (acre) => acre.id === nearestAcreId,
            );

            if (clickedAcre) {
              setClickedAcre(clickedAcre);
              setPopupPosition(coordinates);
              // Get pixel position for marker
              const markerPoint = mapRef.current?.project(coordinates);
              if (markerPoint) {
                // Calculate intelligent popup position
                const popupPoint = calculatePopupPosition(markerPoint);
                setPopupPixelPosition(popupPoint);
              }
              onAcreClick?.(clickedAcre);
              return;
            }
          }
        }
      }

      // Click outside any acre - close popup
      setClickedAcre(null);
      setPopupPosition(null);
      setPopupPixelPosition(null);
      onAcreClick?.(null);
    },
    [data.acres, onAcreClick, calculatePopupPosition],
  );

  // Update popup position when map moves
  useEffect(() => {
    if (popupPosition && mapRef.current) {
      const updatePopupPosition = () => {
        const markerPoint = mapRef.current?.project(popupPosition);
        if (markerPoint) {
          const popupPoint = calculatePopupPosition(markerPoint);
          setPopupPixelPosition(popupPoint);
        }
      };

      const map = mapRef.current;
      map.on("move", updatePopupPosition);
      return () => {
        map.off("move", updatePopupPosition);
      };
    }
  }, [popupPosition, calculatePopupPosition]);

  const center = getCenterFromGeometry(data.bounds);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 });
    }
  };

  const zoomControlsStyle = {
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
        onClick={handleMapClick}
        onMouseMove={(e) => setHoveredPoint([e.lngLat.lng, e.lngLat.lat])}
        onMouseLeave={() => setHoveredPoint(null)}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: 15,
          ...(initialViewState ?? {}),
        }}
        interactiveLayerIds={[
          "gradient-mesh",
          "farm-base-fill",
          "acre-boundaries",
        ]}
        cursor={hoveredPoint ? "pointer" : "grab"}
      >
        {/* Base fill to mask the gradient */}
        <Source id="farm-base" type="geojson" data={farmBoundary}>
          <Layer
            id="farm-base-fill"
            type="fill"
            paint={{
              "fill-color": "#000000",
              "fill-opacity": 0.01, // Nearly transparent
            }}
          />
        </Source>

        {/* Gradient mesh layer */}
        {gradientMesh && (
          <Source id="gradient-mesh" type="geojson" data={gradientMesh}>
            <Layer
              id="gradient-mesh"
              type="fill"
              paint={{
                "fill-color": ["get", "color"],
                "fill-opacity": 0.95,
              }}
            />
          </Source>
        )}

        {/* Farm boundary outline */}
        <Source id="farm-boundary" type="geojson" data={farmBoundary}>
          <Layer
            id="farm-outline"
            type="line"
            paint={{
              "line-color": "#FFFFFF",
              "line-width": 3,
              "line-opacity": 1,
            }}
          />
        </Source>

        {/* Acre labels (original implementation) */}
        {showLabels &&
          data.acres.map((acre) => (
            <Source
              key={acre.id}
              id={`label-${acre.id}`}
              type="geojson"
              data={{
                type: "Feature",
                properties: { label: acre.id },
                geometry: {
                  type: "Point",
                  coordinates: acre.centroid,
                },
              }}
            >
              <Layer
                id={`label-text-${acre.id}`}
                type="symbol"
                layout={{
                  "text-field": ["get", "label"],
                  "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                  "text-size": 14,
                  "text-anchor": "center",
                }}
                paint={{
                  "text-color": "#FFFFFF",
                  "text-halo-color": "#000000",
                  "text-halo-width": 1,
                }}
              />
            </Source>
          ))}

        {/* Invisible acre boundaries for click detection */}
        <Source id="acre-boundaries" type="geojson" data={acreBoundaries}>
          <Layer
            id="acre-boundaries"
            type="fill"
            paint={{
              "fill-opacity": 0, // Completely invisible
            }}
          />
        </Source>

        {/* Central acre labels with custom backgrounds */}
        {showAcreLabels && acreLabels && (
          <Source id="acre-labels" type="geojson" data={acreLabels}>
            <Layer
              id="acre-labels-layer"
              type="symbol"
              layout={{
                "text-field": ["get", "id"],
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                "text-size": labelStyle?.textSize ?? 14,
                "text-anchor": "center",
                "text-allow-overlap": true,
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

        {/* Center label for the entire farm */}
        {showCenterLabel && centerLabelText && (
          <Source
            id="farm-center-label"
            type="geojson"
            data={{
              type: "Feature",
              properties: { label: centerLabelText },
              geometry: {
                type: "Point",
                coordinates: farmCenter,
              },
            }}
          >
            <Layer
              id="farm-center-label-layer"
              type="symbol"
              layout={{
                "text-field": ["get", "label"],
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                "text-size":
                  typeof labelStyle?.textSize === "number"
                    ? labelStyle.textSize + 4
                    : 18,
                "text-anchor": "center",
              }}
              paint={{
                "text-color": labelStyle?.textColor ?? "#FFFFFF",
                "text-halo-color":
                  labelStyle?.backgroundColor ?? "rgba(0, 0, 0, 0.9)",
                "text-halo-width": labelStyle?.backgroundWidth
                  ? labelStyle.backgroundWidth + 1
                  : 4,
                "text-halo-blur": 0.5,
              }}
            />
          </Source>
        )}

        {/* Marker at clicked location */}
        {clickedAcre && popupPosition && (
          <>
            {/* Outer circle (stroke only) */}
            <Source
              id="clicked-marker-outer"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: popupPosition,
                },
              }}
            >
              <Layer
                id="clicked-marker-outer-layer"
                type="circle"
                paint={{
                  "circle-radius": 8,
                  "circle-color": "transparent",
                  "circle-stroke-width": 3,
                  "circle-stroke-color": getSoilLevelColor(
                    clickedAcre.soilLevel,
                  ),
                  "circle-stroke-opacity": 0.9,
                }}
              />
            </Source>

            {/* Inner circle (filled) */}
            <Source
              id="clicked-marker-inner"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: popupPosition,
                },
              }}
            >
              <Layer
                id="clicked-marker-inner-layer"
                type="circle"
                paint={{
                  "circle-radius": 4,
                  "circle-color": getSoilLevelColor(clickedAcre.soilLevel),
                  "circle-opacity": 1,
                }}
              />
            </Source>
          </>
        )}
      </Map>

      {/* Not started indicator */}
      {/* <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 shadow-md">
        <span className="text-sm text-gray-600">Not started</span>
      </div> */}

      {/* Custom Popup Overlay */}
      {clickedAcre && popupPixelPosition && popupPosition && (
        <>
          {(() => {
            // Get marker pixel position
            const markerPoint = mapRef.current?.project(popupPosition);
            if (!markerPoint) return null;

            const markerX = markerPoint.x;
            const markerY = markerPoint.y;
            const popupX = popupPixelPosition.x;
            const popupY = popupPixelPosition.y;

            // Calculate connection points
            const popupWidth = 140;
            const popupHeight = 80;

            let connectionX, connectionY;

            // Determine which side of the popup to connect to
            const deltaX = popupX - markerX;
            const deltaY = popupY - markerY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // Horizontal connection (left or right side of popup)
              if (deltaX > 0) {
                // Popup is to the right, connect to left side
                connectionX = popupX - popupWidth / 2;
                connectionY = popupY;
              } else {
                // Popup is to the left, connect to right side
                connectionX = popupX + popupWidth / 2;
                connectionY = popupY;
              }
            } else {
              // Vertical connection (top or bottom of popup)
              if (deltaY > 0) {
                // Popup is below, connect to top
                connectionX = popupX;
                connectionY = popupY - popupHeight / 2;
              } else {
                // Popup is above, connect to bottom
                connectionX = popupX;
                connectionY = popupY + popupHeight / 2;
              }
            }

            // Calculate line properties
            const lineLength = Math.sqrt(
              Math.pow(connectionX - markerX, 2) +
                Math.pow(connectionY - markerY, 2),
            );
            const angle =
              Math.atan2(connectionY - markerY, connectionX - markerX) *
              (180 / Math.PI);

            return (
              /* Connection line using div */
              <div
                className="pointer-events-none absolute z-40"
                style={{
                  left: `${markerX}px`,
                  top: `${markerY}px`,
                  width: `${lineLength}px`,
                  height: "2px",
                  backgroundColor: "#FEF0D8",
                  opacity: 0.8,
                  transformOrigin: "0 50%",
                  transform: `rotate(${angle}deg)`,
                }}
              />
            );
          })()}

          {/* Popup */}
          <div
            className="pointer-events-none absolute z-50"
            style={{
              left: `${popupPixelPosition.x}px`,
              top: `${popupPixelPosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={cn(
                "pointer-events-auto relative min-w-[220px] rounded-lg border px-4 py-3 shadow-xl",
                clickedAcre.status === "high"
                  ? "border-blue-200 bg-blue-50" // Blue for high
                  : clickedAcre.status === "adequate"
                    ? "border-green-200 bg-green-50" // Green for adequate
                    : clickedAcre.status === "low"
                      ? "border-yellow-200 bg-yellow-50" // Yellow for low
                      : clickedAcre.status === "very low"
                        ? "border-red-200 bg-red-50" // Red for very low
                        : "border-gray-200 bg-gray-50", // Gray for unknown/default
              )}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {/* Status text */}
              <div className="mb-1 text-xs font-medium capitalize text-gray-700">
                {clickedAcre.status}
              </div>

              {/* Nutrient value and unit (fallback to production rate) */}
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-gray-900">
                  {typeof clickedAcre.nutrientValue === "number"
                    ? `${clickedAcre.nutrientValue.toFixed(2)} ${clickedAcre.unit ?? ""}`.trim()
                    : `${clickedAcre.productionRate} kg/h`}
                </span>
                <span className="text-xs text-gray-500">Crop</span>
              </div>
            </div>
          </div>
        </>
      )}
      {mapZoom && (
        <div className="absolute flex flex-col" style={zoomControlsStyle}>
          <button
            onClick={handleZoomIn}
            className="flex size-9 items-center justify-center rounded-t-sm bg-white opacity-50 shadow-lg hover:bg-white hover:opacity-100 focus:outline-none active:bg-white active:opacity-100"
            aria-label="Zoom in"
          >
            <Plus className="size-7" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex size-9 items-center justify-center rounded-b-sm bg-white opacity-50 shadow-lg hover:bg-white hover:opacity-100 focus:outline-none active:bg-white active:opacity-100"
            aria-label="Zoom out"
          >
            <Minus className="size-7" />
          </button>
        </div>
      )}
    </div>
  );
}
