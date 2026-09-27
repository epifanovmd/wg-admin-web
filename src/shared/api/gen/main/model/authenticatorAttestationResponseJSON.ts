import type { AuthenticatorTransportFuture } from "./authenticatorTransportFuture.ts";
import type { Base64URLString } from "./base64URLString.ts";
import type { COSEAlgorithmIdentifier } from "./cOSEAlgorithmIdentifier.ts";

export interface AuthenticatorAttestationResponseJSON {
  clientDataJSON: Base64URLString;
  attestationObject: Base64URLString;
  authenticatorData?: Base64URLString;
  transports?: AuthenticatorTransportFuture[];
  publicKeyAlgorithm?: COSEAlgorithmIdentifier;
  publicKey?: Base64URLString;
}
