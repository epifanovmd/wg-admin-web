/**
 * Команда установки агента: срок токена.
 */
export interface ICreateWgNodeInstallCommandBody {
  /** Срок одноразового токена регистрации, минут (по умолчанию сутки). */
  expiresInMinutes?: number;
}
