import type { ActionItem } from "@/components/customer-management/formal-grower/details/formal-grower-detail-content";
import type { TableActionItem } from "@/components/table/data-table-component";
import { STATUSES } from "@/utils/constants/status-constants";

export function filterUserActionsByStatus<T>(
  actions: TableActionItem<T>[],
  status: string,
  t: (key: string) => string,
): TableActionItem<T>[] {
  const userStatus = status.toLowerCase();
  const isPending = userStatus === STATUSES.pending;
  const isDeactivated = userStatus === STATUSES.deactivated;

  return actions.filter((action) => {
    if (isDeactivated) {
      return action.actionName === t("userTable.actions.view");
    }

    if (
      action.actionName === t("userTable.actions.deactivate") &&
      (isDeactivated || isPending)
    ) {
      return false;
    }

    if (isPending) {
      if (action.actionName === t("userTable.actions.edit")) {
        return false;
      }
    } else {
      if (action.actionName === t("userTable.actions.resendInvite")) {
        return false;
      }
    }

    return true;
  });
}

export function filterFormalGrowerActionsByStatus<T>(
  actions: TableActionItem<T>[],
  status: string,
  t: (key: string) => string,
): TableActionItem<T>[] {
  const userStatus = status.toLowerCase();

  return actions.filter((action) => {
    // Active: view details, request suspension
    if (userStatus === STATUSES.active) {
      return (
        action.actionName === t("formalGrowerTable.actions.view") ||
        action.actionName === t("formalGrowerTable.actions.requestSuspension")
      );
    }

    // Pending or Expired: resend invite
    if (userStatus === STATUSES.pending) {
      return action.actionName === t("formalGrowerTable.actions.resendInvite");
    }

    // Deactivated: view details
    if (userStatus === STATUSES.deactivated) {
      return (
        action.actionName === t("formalGrowerTable.actions.view") ||
        action.actionName === t("formalGrowerTable.actions.requestReactivation")
      );
    }

    // Pending Suspension: view details
    if (userStatus === STATUSES["pending suspension"]) {
      return action.actionName === t("formalGrowerTable.actions.view");
    }

    // Suspended: view details, request reactivation
    if (userStatus === STATUSES.suspended) {
      return (
        action.actionName === t("formalGrowerTable.actions.view") ||
        action.actionName === t("formalGrowerTable.actions.requestReactivation")
      );
    }

    // Default: allow nothing
    return false;
  });
}

export function filterCustomerDetailActionsByStatus(
  actions: ActionItem[],
  status: string,
  t: (key: string) => string,
): ActionItem[] {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case STATUSES.active:
      return actions.filter(
        (action) => action.actionName === t("actions.requestSuspension"),
      );
    case STATUSES.suspended:
      return actions.filter(
        (action) => action.actionName === t("actions.reactivate"),
      );
    case STATUSES.deactivated:
      return actions.filter(
        (action) => action.actionName === t("actions.requestReactivation"),
      );
    default:
      return [];
  }
}

export function filterAgentTableActionsByStatus<T>(
  actions: TableActionItem<T>[],
  status: string,
  t: (key: string) => string,
): TableActionItem<T>[] {
  const userStatus = status.toLowerCase();

  return actions.filter((action) => {
    // Active: view details, request suspension
    if (userStatus === STATUSES.active) {
      return (
        action.actionName === t("agentsTable.actions.view") ||
        action.actionName === t("agentsTable.actions.requestSuspension")
      );
    }

    // Pending or Expired: resend invite
    if (userStatus === STATUSES.pending) {
      return action.actionName === t("agentsTable.actions.resendInvite");
    }

    // Deactivated: view details
    if (userStatus === STATUSES.deactivated) {
      return (
        action.actionName === t("agentsTable.actions.view") ||
        action.actionName === t("agentsTable.actions.requestReactivation")
      );
    }

    // Pending Suspension: view details
    if (userStatus === STATUSES["pending suspension"]) {
      return action.actionName === t("agentsTable.actions.view");
    }

    // Suspended: view details, request reactivation
    if (userStatus === STATUSES.suspended) {
      return (
        action.actionName === t("agentsTable.actions.view") ||
        action.actionName === t("agentsTable.actions.requestReactivation")
      );
    }

    // Default: allow nothing
    return false;
  });
}
