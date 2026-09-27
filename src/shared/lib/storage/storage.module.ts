import { ContainerModule } from "inversify";

import { StorageService } from "./storage.service";
import { IStorageService } from "./storage.types";

export const storageModule = new ContainerModule(({ bind }) => {
  bind(IStorageService.Tid).to(StorageService).inSingletonScope();
});
