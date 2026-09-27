import type { AuthenticatorAttachment } from "./authenticatorAttachment.ts";
import type { ResidentKeyRequirement } from "./residentKeyRequirement.ts";
import type { UserVerificationRequirement } from "./userVerificationRequirement.ts";

export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  requireResidentKey?: boolean;
  residentKey?: ResidentKeyRequirement;
  userVerification?: UserVerificationRequirement;
}
