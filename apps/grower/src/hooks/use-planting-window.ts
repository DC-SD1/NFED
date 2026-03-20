import type { components } from "@cf/api";
import { useCallback, useEffect, useState } from "react";

import type { AnalysisResults } from "@/components/farm-plan/results-card";
import { useApiClient } from "@/lib/api/client";
import { logger } from "@/lib/utils/logger";

interface UsePlantingWindowParams {
  cropVariety: string;
  farmDetails: components["schemas"]["FarmDetailsResponse"] | null;
  cropId: string | undefined;
  enabled?: boolean;
  forceShow?: boolean;
}

export function usePlantingWindow({
  cropVariety,
  farmDetails,
  cropId,
  enabled = true,
  forceShow = false,
}: UsePlantingWindowParams) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(forceShow);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);

  const api = useApiClient();

  useEffect(() => {
    // If forceShow is enabled, always show results without fetching
    if (forceShow) {
      setShowResults(true);
      return;
    }

    if (
      !enabled ||
      !cropVariety ||
      !farmDetails?.location?.centroid ||
      !cropId
    ) {
      return;
    }

    const fetchPlantingWindow = async () => {
      try {
        setIsAnalyzing(true);
        setShowResults(false);

        const { data, error } = await api.client.GET(
          "/farm-planning/planting-window",
          {
            params: {
              query: {
                Latitude: farmDetails.location?.centroid?.latitude || 0,
                Longitude: farmDetails.location?.centroid?.longitude || 0,
                CropId: cropId,
              },
            },
          },
        );

        if (error || !data?.success || !data.data) {
          logger.error("Failed to fetch planting window", error);
          setIsAnalyzing(false);
          return;
        }

        // Map API response to our interface
        const analysisTexts: string[] = [];
        if (data.data.analysis?.location) {
          analysisTexts.push(
            `Located in ${data.data.zone} agro-ecological zone`,
          );
        }
        if (data.data.analysis?.weatherAnalysisDetected) {
          analysisTexts.push(
            "Although weather analysis detected a good planting window, it falls outside the crop's agronomic season",
          );
        }
        if (data.data.analysis?.agronomicTiming) {
          analysisTexts.push(
            "Following crop calendar for optimal agronomic timing",
          );
        }

        setAnalysisResults({
          confidence: data.data.confidence || "Medium confidence",
          zone: data.data.zone || "",
          recommendedDate:
            data.data.recommendedDate ||
            new Date().toISOString().split("T")[0] ||
            "",
          analysis: analysisTexts,
        });

        setIsAnalyzing(false);
        setShowResults(true);
      } catch (err) {
        logger.error("Error fetching planting window", err);
        setIsAnalyzing(false);
      }
    };

    void fetchPlantingWindow();
  }, [cropVariety, farmDetails, cropId, enabled, forceShow, api]);

  const resetResults = useCallback(() => {
    setShowResults(false);
    setIsAnalyzing(false);
    setAnalysisResults(null);
  }, []);

  return {
    isAnalyzing,
    showResults,
    analysisResults,
    resetResults,
  };
}
