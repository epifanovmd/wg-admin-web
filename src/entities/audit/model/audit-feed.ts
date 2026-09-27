import type {
  AuditEventDto,
  ICursorPageDtoAuditEventDto,
} from "@shared/api/gen/main/model";
import {
  CursorHolder,
  type IApiResponse,
  isCancelResponse,
} from "@shared/lib/holders";
import { makeAutoObservable, runInAction } from "mobx";

export const AUDIT_PAGE_SIZE = 30;

/** Страница журнала по курсору; `undefined` — первая страница. */
export type AuditPageFetcher = (
  cursor: string | undefined,
  limit: number,
) => Promise<IApiResponse<ICursorPageDtoAuditEventDto>>;

/** Лента журнала с подгрузкой по серверному курсору `nextCursor`. */
export class AuditFeed {
  private _holder = new CursorHolder<AuditEventDto>({
    keyExtractor: e => e.id,
    limit: AUDIT_PAGE_SIZE,
  });

  private _cursor: string | null = null;

  constructor(private _fetch: AuditPageFetcher) {
    makeAutoObservable<this, "_fetch">(
      this,
      { _fetch: false },
      { autoBind: true },
    );
  }

  get items() {
    return this._holder.items;
  }

  get isLoading() {
    return this._holder.isLoading;
  }

  get isLoadingMore() {
    return this._holder.isLoadingMore;
  }

  get hasMore() {
    return this._holder.hasMore;
  }

  get error() {
    return this._holder.error ?? this._holder.loadMoreError;
  }

  async load() {
    this._holder.setLoading();

    const res = await this._fetch(undefined, AUDIT_PAGE_SIZE);

    if (isCancelResponse(res)) return;

    runInAction(() => {
      if (res.error || !res.data) {
        this._holder.setError(res.error ?? "Журнал недоступен");

        return;
      }

      this._cursor = res.data.nextCursor;
      this._holder.setItems(res.data.items, !!res.data.nextCursor);
    });
  }

  async loadMore() {
    if (!this._cursor || this._holder.isLoadingMore) return;

    this._holder.setLoadingOlder();

    const res = await this._fetch(this._cursor, AUDIT_PAGE_SIZE);

    if (isCancelResponse(res)) return;

    runInAction(() => {
      if (res.error || !res.data) {
        this._holder.setOlderError(
          res.error ?? { message: "Журнал недоступен" },
        );

        return;
      }

      this._cursor = res.data.nextCursor;
      this._holder.appendItems(res.data.items, !!res.data.nextCursor);
    });
  }
}
