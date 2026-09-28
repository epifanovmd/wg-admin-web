import { IMainApi } from "@shared/api";
import type { IPermissionCatalogDto } from "@shared/api/gen/main/model";
import { EntityHolder } from "@shared/lib/holders";
import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

import { IPermissionCatalogStore } from "./types";

@injectable()
export class PermissionCatalogStore implements IPermissionCatalogStore {
  private _holder = new EntityHolder<IPermissionCatalogDto>({
    onFetch: () => this._api.getPermissionCatalog(),
  });

  constructor(@IMainApi() private _api: IMainApi) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get groups() {
    return this._holder.data?.groups ?? [];
  }

  get isLoading() {
    return this._holder.isLoading;
  }

  get error() {
    return this._holder.error;
  }

  private get _labels(): Map<string, string> {
    return new Map(
      this.groups.flatMap(group =>
        group.permissions.map(p => [p.name, p.label] as const),
      ),
    );
  }

  labelOf(name: string): string {
    return this._labels.get(name) ?? name;
  }

  async load() {
    if (this._holder.isFilled || this._holder.isBusy) return;

    await this._holder.load();
  }
}
