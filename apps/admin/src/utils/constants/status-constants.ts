export const STATUS_COLORS: Record<string, string> = {
  active: "text-[#008744]",
  completed: "text-[#008744]",
  deactivated: "text-[#BA1A1A]",
  rejected: "text-[#BA1A1A]",
  inactive: "text-[#BA1A1A]",
  pending: "text-[#995917]",
  invited: "text-[#995917]",
  "pending suspension": "text-[#0063EA]",
  "in progress": "text-[#00439E]",
  suspended: "text-[#BA1A1A]",
  expired: "text-[#525C4E]",
  "in training": "text-[#0063EA]",
  accepted: "text-[#008744]",
};

export const STATUSES = {
  active: "active",
  deactivated: "deactivated",
  inactive: "inactive",
  pending: "pending",
  invited: "invited",
  "pending suspension": "pending suspension",
  suspended: "suspended",
  expired: "expired",
  inProgress: "in-progress",
  new: "new",
  rejected: "rejected",
  completed: "completed",
  inReview: "in-review",
  approved: "approved",
  declined: "declined",
  required: "required",
  accepted: "accepted",
};

export const EXPORT_TYPES = {
  allItems: "all-items",
  itemsMatchingAppliedFilters: "items-matching-applied-filters",
};

export const STATUS_BOLD_COLORS: Record<string, string> = {
  active: "bg-[#C9F0D6] text-[#00572D] hover:bg-[#C9F0D6] border-[#C9F0D6]",
  accepted: "bg-[#C9F0D6] text-[#00572D] hover:bg-[#C9F0D6] border-[#C9F0D6]",
  approved: "bg-[#C9F0D6] text-[#00572D] hover:bg-[#C9F0D6] border-[#C9F0D6]",
  suspended: "bg-[#FFDAD6] text-[#8F0004] hover:bg-[#FFDAD6] border-[#FFDAD6]",
  deactivated:
    "bg-[#FFDAD6] text-[#8F0004] hover:bg-[#FFDAD6] border-[#FFDAD6]",
  declined: "bg-[#FFDAD6] text-[#8F0004] hover:bg-[#FFDAD6] border-[#FFDAD6]",
  pending: "bg-[#FEF0D8] text-[#995917] hover:bg-[#FEF0D8] border-[#FEF0D8]",
  "pending suspension":
    "bg-[#FEF0D8] text-[#995917] hover:bg-[#FEF0D8] border-[#FEF0D8]",
};

export const COMPLIANCE_STATUS = {
  lowRisk: "LOW RISK",
  highRisk: "HIGH RISK",
  notAssigned: "Not assigned",
  prohibited: "PROHIBITED",
};
