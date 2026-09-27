import type { I2FARequiredDto } from "./i2FARequiredDto.ts";
import type { IUserWithTokensDto } from "./iUserWithTokensDto.ts";

export type ISignInResponseDto = IUserWithTokensDto | I2FARequiredDto;
