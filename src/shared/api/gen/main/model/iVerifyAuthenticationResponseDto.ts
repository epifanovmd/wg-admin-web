import type { ITokensDto } from "./iTokensDto.ts";

export interface IVerifyAuthenticationResponseDto {
  verified: boolean;
  tokens?: ITokensDto;
}
