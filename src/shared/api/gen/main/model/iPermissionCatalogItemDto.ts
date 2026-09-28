import type { TPermission } from "./tPermission.ts";

/**
 * Право в каталоге: имя и подпись.
 */
export interface IPermissionCatalogItemDto {
  name: TPermission;
  label: string;
}
