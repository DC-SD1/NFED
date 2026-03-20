// Basic coordinate type for better type safety
export type Coordinate = [longitude: number, latitude: number];

// Individual acre data with soil information
export interface SoilAcreData {
  id: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  centroid: Coordinate;
  soilLevel: number; // 0-100 scale
  productionRate: number; // kg/h
  status: "high" | "medium" | "low" | "very low" | "adequate";
  // Optional raw nutrient value and unit for tooltip display
  nutrientValue?: number;
  unit?: string;
}

// Complete farm soil response data
export interface FarmSoilResponse {
  farmId: string;
  farmName: string;
  totalAcres: number;
  acres: SoilAcreData[];
  bounds: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

// Gradient mesh point for rendering
export interface GradientPoint {
  coordinate: Coordinate;
  soilLevel: number;
  color: string;
  weight: number;
}

// Grid cell for gradient mesh
export interface GridCell {
  id: string;
  bounds: [Coordinate, Coordinate, Coordinate, Coordinate];
  center: Coordinate;
  soilLevel: number;
  color: string;
}

// Popup position and state
export interface PopupState {
  acre: SoilAcreData | null;
  position: Coordinate | null;
  pixelPosition: { x: number; y: number } | null;
  isVisible: boolean;
}

// Movement mode for optimization
export type MovementMode = "static" | "panning" | "zooming";

// Map view state
export interface MapViewState {
  center: Coordinate;
  zoom: number;
  bounds: [[number, number], [number, number]] | null;
  movementMode: MovementMode;
}

// Center label configuration
export interface CenterLabelConfig {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  padding?: [number, number, number, number]; // [top, right, bottom, left]
  visible?: boolean;
}

// Props for the main component
export interface SoilGradientMapProps {
  data: FarmSoilResponse;
  className?: string;
  mapboxAccessToken?: string;
  mapStyle?: string;
  initialZoom?: number;
  fitBounds?: boolean;
  showLabels?: boolean;
  centerLabel?: CenterLabelConfig;
  boundsPadding?: {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  };
  onAcreClick?: (acre: SoilAcreData | null) => void;
  onMapReady?: () => void;
  onRegionChange?: (region: MapViewState) => void;
  testID?: string;
  accessible?: boolean;
}

// Props for the popup component
export interface MapPopupProps {
  acre: SoilAcreData;
  position: Coordinate;
  onClose: () => void;
  mapDimensions: { width: number; height: number };
  testID?: string;
}

// Hook return types
export interface UseGradientMeshReturn {
  mesh: GradientPoint[] | null;
  isCalculating: boolean;
  error: Error | null;
}

export interface UseSoilDataProcessorReturn {
  processedData: GradientPoint[];
  bounds: [[number, number], [number, number]];
  center: Coordinate;
}

// Color interpolation types
export interface ColorStop {
  threshold: number;
  color: { r: number; g: number; b: number };
}

export interface ColorRange {
  start: { r: number; g: number; b: number };
  end: { r: number; g: number; b: number };
  threshold: number;
}

// Performance tracking
export interface PerformanceMetrics {
  meshCalculationTime: number;
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
}

// Soil level status types
export type SoilLevelStatus = "very-low" | "low" | "adequate" | "high";

// Individual soil metric data
export interface SoilMetric {
  nutrientKey: string | null; // null for non-interactive metrics like Soil Texture
  title: string;
  value: string;
  unit?: string;
  level?: SoilLevelStatus;
}

// Nutrient configuration for gradient generation
export interface NutrientConfig {
  range: [number, number];
  unit: string;
  thresholds: {
    veryLow: number;
    low: number;
    adequate: number;
    high: number;
  };
  displayName: string;
  color: {
    low: string;
    medium: string;
    high: string;
  };
}

// Acre grid data for generation
export interface AcreGridData {
  id: string;
  centroid: Coordinate;
  bounds: Coordinate[];
}

// Line segment type for polygon intersection calculation
export interface LineSegment {
  start: Coordinate;
  end: Coordinate;
}
