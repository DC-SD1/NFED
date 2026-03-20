import { describe, expect, it } from "vitest";

import { extractFarmEntityIds, getWorkflowPath } from "./workflow-config";

describe("extractFarmEntityIds", () => {
  it("should extract all valid farm entity IDs", () => {
    const payload = {
      farmPlanId: "plan-123",
      farmId: "farm-456",
      landId: "land-789",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      farmPlanId: "plan-123",
      farmId: "farm-456",
      landId: "land-789",
    });
  });

  it("should handle missing farmPlanId", () => {
    const payload = {
      farmId: "farm-456",
      landId: "land-789",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      farmId: "farm-456",
      landId: "land-789",
    });
  });

  it("should handle missing farmId", () => {
    const payload = {
      farmPlanId: "plan-123",
      landId: "land-789",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      farmPlanId: "plan-123",
      landId: "land-789",
    });
  });

  it("should handle missing landId", () => {
    const payload = {
      farmPlanId: "plan-123",
      farmId: "farm-456",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      farmPlanId: "plan-123",
      farmId: "farm-456",
    });
  });

  it("should handle empty payload", () => {
    const result = extractFarmEntityIds({});

    expect(result).toEqual({});
  });

  it("should handle undefined payload", () => {
    const result = extractFarmEntityIds(undefined);

    expect(result).toEqual({});
  });

  it("should handle non-string values", () => {
    const payload = {
      farmPlanId: 123,
      farmId: null,
      landId: undefined,
      otherField: "other",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({});
  });

  it("should trim whitespace from IDs", () => {
    const payload = {
      farmPlanId: "  plan-123  ",
      farmId: " farm-456 ",
      landId: "land-789   ",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      farmPlanId: "plan-123",
      farmId: "farm-456",
      landId: "land-789",
    });
  });

  it("should ignore empty string IDs", () => {
    const payload = {
      farmPlanId: "",
      farmId: "   ",
      landId: "land-789",
    };

    const result = extractFarmEntityIds(payload);

    expect(result).toEqual({
      landId: "land-789",
    });
  });
});

describe("getWorkflowPath - farmPlanContext workflows", () => {
  const locale = "en";

  describe("seasonal-reminder-workflow", () => {
    it("should navigate to plan summary with all IDs", () => {
      const payload = {
        farmPlanId: "plan-123",
        farmId: "farm-456",
        landId: "land-789",
      };

      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-plan/summary?farmPlanId=plan-123&farmId=farm-456&landId=land-789",
      );
    });

    it("should navigate to plan summary with only farmPlanId and farmId", () => {
      const payload = {
        farmPlanId: "plan-123",
        farmId: "farm-456",
      };

      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-plan/summary?farmPlanId=plan-123&farmId=farm-456",
      );
    });

    it("should navigate to farm details when farmPlanId missing", () => {
      const payload = {
        farmId: "farm-456",
        landId: "land-789",
      };

      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-lands/details/farm-456?landId=land-789",
      );
    });

    it("should navigate to farm details without landId query param when only farmId available", () => {
      const payload = {
        farmId: "farm-456",
      };

      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        payload,
      );

      expect(path).toBe("/en/farm-owner/farm-lands/details/farm-456");
    });

    it("should navigate to farms list when no IDs available", () => {
      const payload = {};

      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        payload,
      );

      expect(path).toBe("/en/farm-owner/farm-lands");
    });

    it("should navigate to farms list when payload is undefined", () => {
      const path = getWorkflowPath(
        "seasonal-reminder-workflow",
        locale,
        undefined,
      );

      expect(path).toBe("/en/farm-owner/farm-lands");
    });
  });

  describe("harvest-notification-workflow", () => {
    it("should navigate to plan summary with all IDs", () => {
      const payload = {
        farmPlanId: "plan-abc",
        farmId: "farm-def",
        landId: "land-ghi",
      };

      const path = getWorkflowPath(
        "harvest-notification-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-plan/summary?farmPlanId=plan-abc&farmId=farm-def&landId=land-ghi",
      );
    });

    it("should navigate to farm details when farmPlanId missing", () => {
      const payload = {
        farmId: "farm-def",
        landId: "land-ghi",
      };

      const path = getWorkflowPath(
        "harvest-notification-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-lands/details/farm-def?landId=land-ghi",
      );
    });

    it("should navigate to farms list when no IDs available", () => {
      const path = getWorkflowPath("harvest-notification-workflow", locale, {});

      expect(path).toBe("/en/farm-owner/farm-lands");
    });
  });

  describe("overdue-farm-task-workflow", () => {
    it("should navigate to plan summary with all IDs", () => {
      const payload = {
        farmPlanId: "plan-xyz",
        farmId: "farm-uvw",
        landId: "land-rst",
      };

      const path = getWorkflowPath(
        "overdue-farm-task-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-plan/summary?farmPlanId=plan-xyz&farmId=farm-uvw&landId=land-rst",
      );
    });

    it("should navigate to farm details when farmPlanId missing", () => {
      const payload = {
        farmId: "farm-uvw",
        landId: "land-rst",
      };

      const path = getWorkflowPath(
        "overdue-farm-task-workflow",
        locale,
        payload,
      );

      expect(path).toBe(
        "/en/farm-owner/farm-lands/details/farm-uvw?landId=land-rst",
      );
    });

    it("should navigate to farms list when no IDs available", () => {
      const path = getWorkflowPath("overdue-farm-task-workflow", locale, {});

      expect(path).toBe("/en/farm-owner/farm-lands");
    });
  });

  describe("locale support", () => {
    it("should work with Spanish locale", () => {
      const payload = {
        farmPlanId: "plan-123",
        farmId: "farm-456",
        landId: "land-789",
      };

      const path = getWorkflowPath("seasonal-reminder-workflow", "es", payload);

      expect(path).toBe(
        "/es/farm-owner/farm-plan/summary?farmPlanId=plan-123&farmId=farm-456&landId=land-789",
      );
    });

    it("should work with French locale", () => {
      const payload = {
        farmId: "farm-456",
        landId: "land-789",
      };

      const path = getWorkflowPath(
        "harvest-notification-workflow",
        "fr",
        payload,
      );

      expect(path).toBe(
        "/fr/farm-owner/farm-lands/details/farm-456?landId=land-789",
      );
    });
  });
});

describe("getWorkflowPath - other workflows", () => {
  const locale = "en";

  it("should navigate to profile for kyc-reminder-workflow", () => {
    const path = getWorkflowPath("kyc-reminder-workflow", locale);

    expect(path).toBe("/en/profile");
  });

  it("should navigate to farm managers for farm-owner-manager-joined", () => {
    const path = getWorkflowPath("farm-owner-manager-joined", locale);

    expect(path).toBe("/en/farm-owner/farm-managers");
  });

  it("should return null for unknown workflow", () => {
    const path = getWorkflowPath("unknown-workflow", locale);

    expect(path).toBeNull();
  });

  it("should return null for null workflow", () => {
    const path = getWorkflowPath(null, locale);

    expect(path).toBeNull();
  });

  it("should return null for undefined workflow", () => {
    const path = getWorkflowPath(undefined, locale);

    expect(path).toBeNull();
  });
});
