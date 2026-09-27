import type { UserDto } from "./userDto.ts";

/**
 * Профиль владельца.
 */
export interface ProfileDto {
  id: string;
  userId: string;
  /** @nullable */
  firstName: string | null;
  /** @nullable */
  lastName: string | null;
  /** @nullable */
  birthDate: string | null;
  /** @nullable */
  gender: string | null;
  /** @nullable */
  locale: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserDto;
}
