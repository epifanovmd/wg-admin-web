import type { CredentialPropertiesOutput } from "./credentialPropertiesOutput.ts";

/**
 * Результаты расширений от аутентификатора.
 */
export interface AuthenticationExtensionsClientOutputs {
  appid?: boolean;
  credProps?: CredentialPropertiesOutput;
  hmacCreateSecret?: boolean;
}
