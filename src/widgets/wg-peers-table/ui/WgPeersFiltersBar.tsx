import { useDebouncedValue } from "@mantine/hooks";
import { Button, Input, Select, Switch } from "@shared/ui";
import { RotateCcw, Search } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";

import type { IWgPeersFilters } from "../model/types";
import { useWgPeerFilterOptions } from "../model/useWgPeerFilterOptions";

const SEARCH_DEBOUNCE = 300;

type TStatus = "all" | "enabled" | "disabled";

const STATUS_OPTIONS: Array<{ value: TStatus; label: string }> = [
  { value: "all", label: "Все" },
  { value: "enabled", label: "Включённые" },
  { value: "disabled", label: "Выключенные" },
];

const toStatus = (enabled: boolean | undefined): TStatus =>
  enabled === undefined ? "all" : enabled ? "enabled" : "disabled";

const fromStatus = (status: TStatus): boolean | undefined =>
  status === "all" ? undefined : status === "enabled";

export interface WgPeersFiltersBarProps {
  filters: IWgPeersFilters;
  onChange: (patch: Partial<IWgPeersFilters>) => void;
  /** Выбор ноды и интерфейса; на странице интерфейса — не нужен. */
  withLocation?: boolean;
  /** Выбор держателя — только тем, кто видит пиры всех. */
  withOwner: boolean;
}

/** Фильтры списка пиров: нода → интерфейс, держатель, статус, онлайн, поиск. */
export const WgPeersFiltersBar: FC<WgPeersFiltersBarProps> = observer(
  ({ filters, onChange, withLocation = true, withOwner }) => {
    const options = useWgPeerFilterOptions({
      nodeId: filters.nodeId,
      withLocation,
      withOwner,
    });
    const [search, setSearch] = useState(filters.query ?? "");
    const [debounced] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE);

    useEffect(() => {
      if ((filters.query ?? "") !== debounced) {
        onChange({ query: debounced || undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);

    // Внешний сброс (кнопка «Сбросить», «Назад» в браузере) — в поле поиска.
    useEffect(() => {
      if ((filters.query ?? "") !== search.trim())
        setSearch(filters.query ?? "");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.query]);

    const hasFilters =
      Boolean(filters.query || filters.userId || filters.online) ||
      filters.enabled !== undefined ||
      (withLocation && Boolean(filters.nodeId || filters.interfaceId));

    return (
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Поиск по названию"
          leftAddon={<Search size={15} />}
          className="w-full sm:w-64"
          clearable
          onClear={() => setSearch("")}
        />
        {withLocation && (
          <>
            <Select
              value={filters.nodeId ?? null}
              onChange={nodeId =>
                // Интерфейс другой ноды при смене ноды теряет смысл.
                onChange({
                  nodeId: nodeId ?? undefined,
                  interfaceId: undefined,
                })
              }
              options={options.nodes}
              placeholder="Все ноды"
              clearable
              className="w-full sm:w-48"
            />
            <Select
              value={filters.interfaceId ?? null}
              onChange={interfaceId =>
                onChange({ interfaceId: interfaceId ?? undefined })
              }
              options={options.interfaces}
              placeholder="Все интерфейсы"
              clearable
              className="w-full sm:w-56"
            />
          </>
        )}
        {withOwner && (
          <Select
            value={filters.userId ?? null}
            onChange={userId => onChange({ userId: userId ?? undefined })}
            options={options.owners}
            placeholder="Все держатели"
            clearable
            className="w-full sm:w-52"
          />
        )}
        <Select<TStatus>
          value={toStatus(filters.enabled)}
          onChange={status =>
            onChange({ enabled: fromStatus(status ?? "all") })
          }
          options={STATUS_OPTIONS}
          className="w-full sm:w-40"
          aria-label="Статус"
        />
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={Boolean(filters.online)}
            onCheckedChange={online =>
              onChange({ online: online || undefined })
            }
          />
          Только онлайн
        </label>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={() => {
              setSearch("");
              onChange({
                query: undefined,
                userId: undefined,
                enabled: undefined,
                online: undefined,
                ...(withLocation && {
                  nodeId: undefined,
                  interfaceId: undefined,
                }),
              });
            }}
          >
            Сбросить
          </Button>
        )}
      </div>
    );
  },
);
