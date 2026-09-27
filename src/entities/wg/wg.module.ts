import { ContainerModule } from "inversify";

import { WgNodesStore } from "./model/nodes-store";
import { IWgNodesStore } from "./model/types";

export const wgModule = new ContainerModule(({ bind }) => {
  bind(IWgNodesStore.Tid).to(WgNodesStore).inSingletonScope();
});
