/**
 * Выданный токен регистрации и `.env` с ним (показывается один раз).
 */
export interface IAgentIssuedEnvDto {
  env: string;
  token: string;
  tokenId: string;
  /** Срок токена, мс. */
  expiresAt: number;
}
