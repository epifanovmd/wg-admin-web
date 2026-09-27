/**
 * Профиль глазами другого пользователя.
 */
export interface PublicProfileDto {
  id: string;
  userId: string;
  /** @nullable */
  firstName: string | null;
  /** @nullable */
  lastName: string | null;
}
