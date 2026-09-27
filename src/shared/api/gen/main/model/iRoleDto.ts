import type { IPermissionDto } from "./iPermissionDto.ts";
import type { TRole } from "./tRole.ts";

export interface IRoleDto {
  id: string;
  name: TRole;
  createdAt: string;
  updatedAt: string;
  permissions: IPermissionDto[];
}
