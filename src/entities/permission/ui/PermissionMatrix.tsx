import { Empty, Spinner } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useEffect } from "react";

import { IPermissionCatalogStore } from "../model/types";
import { PermissionGroupCard } from "./PermissionGroupCard";

interface PermissionMatrixProps {
  /** Выбранные права. */
  value: readonly string[];
  onChange: (next: string[]) => void;
  /** Весь выбор только для чтения (нет права менять). */
  readOnly?: boolean;
  /** Отдельные права недоступны для изменения. */
  isLocked?: (name: string) => boolean;
}

/**
 * Права по группам каталога с сервера. Действие с областью — «Нет / Свои /
 * Все»: свои — созданные пользователем или назначенные на него.
 */
export const PermissionMatrix: FC<PermissionMatrixProps> = observer(
  ({ value, onChange, readOnly = false, isLocked }) => {
    const catalog = IPermissionCatalogStore.useInstance();

    useEffect(() => {
      void catalog.load();
    }, [catalog]);

    if (catalog.isLoading && catalog.groups.length === 0) {
      return <Spinner className="self-center" />;
    }

    if (catalog.error && catalog.groups.length === 0) {
      return (
        <Empty size="sm" icon="error" title="Каталог прав не загрузился" />
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          «Свои» — сущности, которые пользователь создал или которые назначены
          на него. Действие шире просмотра автоматически расширяет просмотр.
        </p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {catalog.groups.map(group => (
            <PermissionGroupCard
              key={group.key}
              group={group}
              value={value}
              onChange={onChange}
              readOnly={readOnly}
              isLocked={isLocked}
            />
          ))}
        </div>
      </div>
    );
  },
);
