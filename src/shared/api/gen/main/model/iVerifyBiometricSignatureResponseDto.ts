import type { ITokensDto } from "./iTokensDto.ts";

export interface IVerifyBiometricSignatureResponseDto {
  verified: boolean;
  tokens: ITokensDto;
}
