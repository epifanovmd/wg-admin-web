import type { WgNodeDto } from "@shared/api/gen/main/model";
import { createInjectDecorator } from "@shared/lib/di";
import type { IHolderError } from "@shared/lib/holders";

export const IWgNodesStore =
  createInjectDecorator<IWgNodesStore>("IWgNodesStore");

/** Ноды WG: общий список для дашборда, страниц и выпадающих селектов. */
export interface IWgNodesStore {
  readonly nodes: WgNodeDto[];
  readonly isLoading: boolean;
  readonly error: IHolderError | null;
  load(): Promise<void>;
  byId(id: string): WgNodeDto | undefined;
  upsert(node: WgNodeDto): void;
  remove(id: string): void;
}
