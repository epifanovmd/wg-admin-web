import type { AttestationConveyancePreference } from "./attestationConveyancePreference.ts";
import type { AuthenticationExtensionsClientInputs } from "./authenticationExtensionsClientInputs.ts";
import type { AuthenticatorSelectionCriteria } from "./authenticatorSelectionCriteria.ts";
import type { Base64URLString } from "./base64URLString.ts";
import type { PublicKeyCredentialDescriptorJSON } from "./publicKeyCredentialDescriptorJSON.ts";
import type { PublicKeyCredentialParameters } from "./publicKeyCredentialParameters.ts";
import type { PublicKeyCredentialRpEntity } from "./publicKeyCredentialRpEntity.ts";
import type { PublicKeyCredentialUserEntityJSON } from "./publicKeyCredentialUserEntityJSON.ts";

/**
 * Опции для `navigator.credentials.create()`.
 */
export interface PublicKeyCredentialCreationOptionsJSON {
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntityJSON;
  challenge: Base64URLString;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  hints?: string[];
  attestation?: AttestationConveyancePreference;
  attestationFormats?: string[];
  extensions?: AuthenticationExtensionsClientInputs;
}
