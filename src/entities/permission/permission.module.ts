import { ContainerModule } from "inversify";

import { PermissionCatalogStore } from "./model/store";
import { IPermissionCatalogStore } from "./model/types";

export const permissionModule = new ContainerModule(({ bind }) => {
  bind(IPermissionCatalogStore.Tid)
    .to(PermissionCatalogStore)
    .inSingletonScope();
});
