import type { AuthenticationExtensionsClientOutputs } from "./authenticationExtensionsClientOutputs.ts";
import type { AuthenticatorAttachment } from "./authenticatorAttachment.ts";
import type { AuthenticatorAttestationResponseJSON } from "./authenticatorAttestationResponseJSON.ts";
import type { Base64URLString } from "./base64URLString.ts";
import type { PublicKeyCredentialType } from "./publicKeyCredentialType.ts";

/**
 * Ответ браузера на регистрацию passkey.
 */
export interface RegistrationResponseJSON {
  id: Base64URLString;
  rawId: Base64URLString;
  response: AuthenticatorAttestationResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
}
