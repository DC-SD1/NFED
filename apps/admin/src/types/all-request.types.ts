import type { components, paths } from "@cf/api";

export type RequestResponseData =
  paths["/requests"]["get"]["responses"]["200"]["content"]["application/json"];
export type UserRequest = components["schemas"]["RequestItemDto"];

export type KycResponse =
  paths["/kyc/get-kyc"]["get"]["responses"]["200"]["content"]["application/json"];
