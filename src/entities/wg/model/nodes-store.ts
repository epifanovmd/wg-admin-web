import { IMainApi } from "@shared/api";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { CollectionHolder } from "@shared/lib/holders";
import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

import { IWgNodesStore } from "./types";

/** Нод немного — грузим одним списком. */
const NODES_LIMIT = 100;

@injectable()
export class WgNodesStore implements IWgNodesStore {
  private _list = new CollectionHolder<WgNodeDto>({
    onFetch: async () => {
      const { data, error } = await this._api.listWgNodes({
        limit: NODES_LIMIT,
      });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: node => node.id,
  });

  constructor(@IMainApi() private _api: IMainApi) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get nodes() {
    return this._list.items;
  }

  get isLoading() {
    return this._list.isLoading;
  }

  get error() {
    return this._list.error;
  }

  async load() {
    if (this._list.isSuccess) {
      await this._list.refresh();
    } else {
      await this._list.load();
    }
  }

  byId(id: string) {
    return this._list.get(id);
  }

  upsert(node: WgNodeDto) {
    this._list.upsertItem(node.id, node);
  }

  remove(id: string) {
    this._list.removeItem(id);
  }
}
