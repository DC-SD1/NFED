import type { FormalGrower } from "@/types/formal-grower.types";
import type { User } from "@/types/user-management.types";

export type ModalType =
  | "DestructiveConfirmation"
  | "ExportList"
  | "InviteUser"
  | "UserDetails"
  | "UserProfile"
  | "EditUserRole"
  | "EditAccount"
  | "ActivityHistory"
  | "InviteFormalGrower"
  | "RequestToSuspendGrower"
  | "Success"
  | "GrowerSuspensionReason"
  | "ImageView"
  | "InviteAgent"
  | "InviteBuyer"
  | "AssignAgentToFarmland"
  | "ReassignAgentToFarmland"
  | "ConfirmFarmLandAssignment"
  | "EditFulfilmentCenter"
  | "SendMoney"
  | "SelectFulfilmentCenter"
  | "PinConfirmation"
  | null;

export interface ModalData {
  title?: string;
  message?: string;
  user?: User;
  users?: User[];
  isBulk?: boolean;
  formalGrower?: FormalGrower;
  formalGrowers?: FormalGrower[];
  exportName?: "growers" | "users" | "agents" | "buyers" | "fulfilment-centers";
  fileUrl?: string;
  belongsTo?: BelongsTo;
  primaryButton?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "unstyled";
  };

  [key: string]: any;
}

// This is for using one modal for multiple user types
type BelongsTo = "agent" | "prospective agent";
