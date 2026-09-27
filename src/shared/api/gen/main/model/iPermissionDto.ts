import type { TPermission } from "./tPermission.ts";

export interface IPermissionDto {
  id: string;
  name: TPermission;
  createdAt: string;
  updatedAt: string;
}
