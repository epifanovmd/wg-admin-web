/**
 * Команда установки агента на ноду и токен регистрации в ней.
 */
export interface IWgNodeInstallCommandDto {
  /** `curl … | sudo sh -s -- --instance … --token … --worker wg …` — выполнить на VPS. */
  command: string;
  /** Токен регистрации (одноразовый, с меткой ноды) — виден только здесь. */
  token: string;
  tokenId: string;
  expiresAt: string;
}
