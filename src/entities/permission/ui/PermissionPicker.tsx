import { Checkbox, Empty, Spinner } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useEffect } from "react";

import { IPermissionCatalogStore } from "../model/types";

interface PermissionPickerProps {
  /** Выбранные права. */
  selected: readonly string[];
  onToggle: (name: string, on: boolean) => void;
  /** Весь выбор только для чтения (нет права менять). */
  readOnly?: boolean;
  /** Отдельные права недоступны для изменения. */
  isLocked?: (name: string) => boolean;
}

/** Выбор прав по группам каталога с сервера. */
export const PermissionPicker: FC<PermissionPickerProps> = observer(
  ({ selected, onToggle, readOnly = false, isLocked }) => {
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
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
        {catalog.groups.map(group => (
          <fieldset key={group.key} className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">
              {group.label}
            </legend>
            {group.permissions.map(permission => (
              <Checkbox
                key={permission.name}
                label={permission.label}
                description={permission.name}
                disabled={readOnly || !!isLocked?.(permission.name)}
                checked={selected.includes(permission.name)}
                onCheckedChange={on => onToggle(permission.name, on === true)}
              />
            ))}
          </fieldset>
        ))}
      </div>
    );
  },
);
