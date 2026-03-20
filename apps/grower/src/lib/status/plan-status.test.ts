import { parse } from "date-fns";
import { describe, expect, it } from "vitest";

import { computeChipStatus, derivePlanStatusLine } from "./plan-status";

describe("derivePlanStatusLine", () => {
  const now = new Date("2025-01-10T00:00:00.000Z");

  it("returns completed for Completed status", () => {
    const res = derivePlanStatusLine("Completed", "12/01/2025", now);
    expect(res?.labelKey).toBe("plans.status.completed");
    expect(res?.color).toBe("success");
  });

  it("returns cancelled for Cancelled status", () => {
    const res = derivePlanStatusLine("Cancelled", "12/01/2025", now);
    expect(res?.labelKey).toBe("plans.status.cancelled");
    expect(res?.color).toBe("destructive");
  });

  it("returns due today when start date is today", () => {
    const res = derivePlanStatusLine(undefined, "10/01/2025", now);
    expect(res?.labelKey).toBe("plans.statusLine.dueToday");
    expect(res?.color).toBe("success");
  });

  it("returns months to go for > 30 days", () => {
    const res = derivePlanStatusLine(undefined, "15/03/2025", now);
    expect(res?.labelKey).toBe("plans.statusLine.monthsToGo");
    expect(res?.color).toBe("info");
  });
});

describe("computeChipStatus", () => {
  const now = parse("10/10/2025", "dd/MM/yyyy", new Date());

  it("Overdue for past dates", () => {
    expect(computeChipStatus("01/10/2025", now)).toBe("Overdue");
  });
  it("Due for today", () => {
    expect(computeChipStatus("10/10/2025", now)).toBe("Due");
  });
  it("Due soon for within 7 days", () => {
    expect(computeChipStatus("12/10/2025", now)).toBe("Due soon");
  });
  it("Upcoming for beyond 7 days", () => {
    expect(computeChipStatus("12/12/2025", now)).toBe("Upcoming");
  });
});
