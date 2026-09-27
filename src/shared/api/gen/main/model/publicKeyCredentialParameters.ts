import type { COSEAlgorithmIdentifier } from "./cOSEAlgorithmIdentifier.ts";
import type { PublicKeyCredentialType } from "./publicKeyCredentialType.ts";

export interface PublicKeyCredentialParameters {
  alg: COSEAlgorithmIdentifier;
  type: PublicKeyCredentialType;
}
