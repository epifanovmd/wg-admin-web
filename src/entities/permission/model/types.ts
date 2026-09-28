import type { IPermissionCatalogGroupDto } from "@shared/api/gen/main/model";
import { createInjectDecorator } from "@shared/lib/di";
import type { IHolderError } from "@shared/lib/holders";

export const IPermissionCatalogStore =
  createInjectDecorator<IPermissionCatalogStore>("IPermissionCatalogStore");

/**
 * Каталог прав с сервера: группы с подписями для редакторов ролей и прав
 * пользователей. Каталог меняется только с деплоем — грузится один раз.
 */
export interface IPermissionCatalogStore {
  readonly groups: IPermissionCatalogGroupDto[];
  readonly isLoading: boolean;
  readonly error: IHolderError | null;

  /** Подпись права; неизвестное каталогу — само имя. */
  labelOf(name: string): string;
  load(): Promise<void>;
}
