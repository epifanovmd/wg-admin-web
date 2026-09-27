import type { IPermissionDto } from "./iPermissionDto.ts";
import type { IRoleDto } from "./iRoleDto.ts";
import type { ProfileDto } from "./profileDto.ts";

/**
 * Пользователь для владельца и администрирования.
 */
export interface UserDto {
  id: string;
  /** @nullable */
  email: string | null;
  emailVerified?: boolean;
  /** @nullable */
  phone: string | null;
  /** @nullable */
  username: string | null;
  profile?: ProfileDto;
  roles: IRoleDto[];
  directPermissions: IPermissionDto[];
  createdAt: string;
  updatedAt: string;
}
