import type { PermissionName } from "./permissionName.ts";

export interface IRolePermissionsRequestDto {
  permissions: PermissionName[];
}
