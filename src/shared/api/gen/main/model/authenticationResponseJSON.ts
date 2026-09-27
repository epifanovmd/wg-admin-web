import type { AuthenticationExtensionsClientOutputs } from "./authenticationExtensionsClientOutputs.ts";
import type { AuthenticatorAssertionResponseJSON } from "./authenticatorAssertionResponseJSON.ts";
import type { AuthenticatorAttachment } from "./authenticatorAttachment.ts";
import type { Base64URLString } from "./base64URLString.ts";
import type { PublicKeyCredentialType } from "./publicKeyCredentialType.ts";

/**
 * Ответ браузера на вход по passkey.
 */
export interface AuthenticationResponseJSON {
  id: Base64URLString;
  rawId: Base64URLString;
  response: AuthenticatorAssertionResponseJSON;
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
}
