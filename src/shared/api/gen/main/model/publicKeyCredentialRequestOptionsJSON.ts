import type { AuthenticationExtensionsClientInputs } from "./authenticationExtensionsClientInputs.ts";
import type { Base64URLString } from "./base64URLString.ts";
import type { PublicKeyCredentialDescriptorJSON } from "./publicKeyCredentialDescriptorJSON.ts";
import type { UserVerificationRequirement } from "./userVerificationRequirement.ts";

/**
 * Опции для `navigator.credentials.get()`.
 */
export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: Base64URLString;
  timeout?: number;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  userVerification?: UserVerificationRequirement;
  hints?: string[];
  extensions?: AuthenticationExtensionsClientInputs;
}
