import type { TWgNodeInstallMode } from "./tWgNodeInstallMode.ts";

/**
 * Команда установки агента: срок токена, способ.
 */
export interface ICreateWgNodeInstallCommandBody {
  /** Срок одноразового токена регистрации, минут (по умолчанию сутки). */
  expiresInMinutes?: number;
  mode?: TWgNodeInstallMode;
}
