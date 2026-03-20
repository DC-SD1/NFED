import type { Feature, MultiPolygon, Polygon } from "geojson";

import type { FarmLandsUploadResponse } from "@/lib/stores/upload-store";

export type GeoFeature = Feature<Polygon | MultiPolygon>;

/**
 * Convert square meters to acres
 * 1 square meter = 0.000247105 acres
 */
export function squareMetersToAcres(squareMeters: number): number {
  return squareMeters * 0.000247105;
}

/**
 * Convert acres to square meters
 * 1 acre = 4046.86 square meters
 */
export function acresToSquareMeters(acres: number): number {
  return acres * 4046.86;
}

/**
 * Format the upload store data for Mapbox GeoJSON
 */
export function formatGeoJsonForMapbox(
  data: FarmLandsUploadResponse,
): Feature<Polygon | MultiPolygon> {
  return {
    type: "Feature",
    geometry: data.geometry, // already correctly typed
    properties: data.properties,
  };
}

/**
 * Get center point from Farm-Land upload
 * (prefer stored centroid, fallback to geometry)
 */
export function getCenterFromGeoJson(data: GeoFeature): [number, number] {
  if (data.properties?.centroidLongitude && data.properties?.centroidLatitude) {
    return [
      data.properties.centroidLongitude,
      data.properties.centroidLatitude,
    ];
  }

  // Fallback – derive from geometry
  return getCenterFromGeometry(data.geometry);
}

/**
 * Get bounds from Farm-Land upload
 */
export function getBoundsFromGeoJson(
  data: MultiPolygon | Polygon,
): [[number, number], [number, number]] {
  return getBoundsFromGeometry(data);
}

/**
 * Format area for display (in acres with proper decimal places)
 */
export function formatArea(acres: number): string {
  if (acres < 1) {
    return acres.toFixed(3);
  } else if (acres < 10) {
    return acres.toFixed(2);
  } else if (acres < 100) {
    return acres.toFixed(1);
  } else {
    return Math.round(acres).toString();
  }
}

/**
 * Clean polygon coordinates by removing problematic duplicate points
 * Uses fuzzy matching with epsilon tolerance to handle near-duplicates
 * Fixes premature polygon closure issues
 */
export function cleanPolygonCoordinates(
  coordinates: number[][][],
  epsilon = 0.00001, // ~1 meter tolerance at equator
): number[][][] {
  if (!coordinates || !Array.isArray(coordinates)) {
    return [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ];
  }

  return coordinates.map((ring) => {
    if (!Array.isArray(ring) || ring.length < 3) {
      return [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ];
    }

    const cleaned: number[][] = [];

    // Helper function to check if two points are effectively the same
    const arePointsEqual = (p1: number[], p2: number[]): boolean => {
      if (!p1 || !p2 || p1.length < 2 || p2.length < 2) return false;
      const lng1 = p1[0];
      const lat1 = p1[1];
      const lng2 = p2[0];
      const lat2 = p2[1];
      if (
        lng1 === undefined ||
        lat1 === undefined ||
        lng2 === undefined ||
        lat2 === undefined
      ) {
        return false;
      }
      return Math.abs(lng1 - lng2) < epsilon && Math.abs(lat1 - lat2) < epsilon;
    };

    // Process each point
    for (let i = 0; i < ring.length; i++) {
      const point = ring[i];
      if (!point || !Array.isArray(point) || point.length < 2) continue;

      const lng = Number(point[0]);
      const lat = Number(point[1]);

      if (isNaN(lng) || isNaN(lat)) continue;

      const currentPoint = [lng, lat];

      // Skip if this point is too close to the previous point
      if (cleaned.length > 0) {
        const lastPoint = cleaned[cleaned.length - 1];
        if (lastPoint && arePointsEqual(currentPoint, lastPoint)) {
          continue; // Skip near-duplicate
        }
      }

      // Special case: If this point equals the first point but we're not at the end,
      // this indicates premature closure. Only allow closure at the very end.
      if (cleaned.length > 0 && i < ring.length - 1) {
        const firstPoint = cleaned[0];
        if (firstPoint && arePointsEqual(currentPoint, firstPoint)) {
          // This is a premature closure - skip it unless it's the last point
          continue;
        }
      }

      cleaned.push(currentPoint);
    }

    // Ensure polygon is properly closed
    if (cleaned.length >= 3) {
      const first = cleaned[0];
      const last = cleaned[cleaned.length - 1];

      // If last point is not close enough to first, add closure
      if (first && last && !arePointsEqual(first, last)) {
        cleaned.push([first[0]!, first[1]!]);
      }
    }

    // Must have at least 4 points for valid polygon (including closure)
    if (cleaned.length < 4) {
      return [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ];
    }

    return cleaned;
  });
}

/* ──────────────────────────────────────────
   Generic geometry helpers (Polygon | MultiPolygon)
   ────────────────────────────────────────── */

/** Flatten coordinates of a Polygon or MultiPolygon into simple `[lng, lat]` pairs */
export function flattenCoordinates(
  geometry: Polygon | MultiPolygon,
): [number, number][] {
  const flat: [number, number][] = [];

  const walk = (coords: any) => {
    if (typeof coords[0] === "number") flat.push(coords as [number, number]);
    else coords.forEach(walk);
  };

  walk(geometry.coordinates);
  return flat;
}

/** Centroid for any Polygon / MultiPolygon */
export function getCenterFromGeometry(
  geometry: Polygon | MultiPolygon,
): [number, number] {
  const coords = flattenCoordinates(geometry);
  if (coords.length === 0) return [0, 0];

  const [sumLng, sumLat] = coords.reduce(
    (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
    [0, 0],
  );

  return [sumLng / coords.length, sumLat / coords.length];
}

/** Bounding box `[[minLng,minLat],[maxLng,maxLat]]` for any Polygon / MultiPolygon */
export function getBoundsFromGeometry(
  geometry: Polygon | MultiPolygon,
): [[number, number], [number, number]] {
  const coords = flattenCoordinates(geometry);
  if (coords.length === 0)
    return [
      [0, 0],
      [0, 0],
    ];

  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;

  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
