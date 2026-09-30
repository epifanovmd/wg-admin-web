import type { IPermissionCatalogGroupDto } from "@shared/api/gen/main/model";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui";
import { ChevronDown } from "lucide-react";
import { FC } from "react";

import {
  applyPreset,
  hasScopedActions,
  levelOf,
  type PermissionPreset,
  setLevel,
} from "../lib/permission-levels";
import { PermissionLevelControl } from "./PermissionLevelControl";

interface PermissionGroupCardProps {
  group: IPermissionCatalogGroupDto;
  value: readonly string[];
  onChange: (next: string[]) => void;
  readOnly: boolean;
  isLocked?: (name: string) => boolean;
}

const PRESETS: { value: PermissionPreset; label: string }[] = [
  { value: "full", label: "Полный доступ" },
  { value: "view-all-edit-own", label: "Всё смотреть — своё менять" },
  { value: "own", label: "Только свои" },
  { value: "view-all", label: "Только просмотр" },
  { value: "none", label: "Нет доступа" },
];

/** Группа прав (обычно сущность): действия с уровнями и шаблоны группы. */
export const PermissionGroupCard: FC<PermissionGroupCardProps> = ({
  group,
  value,
  onChange,
  readOnly,
  isLocked,
}) => {
  const withPresets =
    !readOnly &&
    hasScopedActions(group) &&
    !group.permissions.some(item => isLocked?.(item.name));

  return (
    <section
      aria-label={group.label}
      className="flex flex-col gap-1 rounded-lg border border-border p-3"
    >
      <header className="flex min-h-8 items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{group.label}</h4>
        {withPresets && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ChevronDown size={14} />}
              >
                Шаблон
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PRESETS.map(preset => (
                <DropdownMenuItem
                  key={preset.value}
                  onSelect={() =>
                    onChange(applyPreset(value, group, preset.value))
                  }
                >
                  {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <ul className="flex flex-col divide-y divide-border">
        {group.permissions.map(item => {
          const state = levelOf(value, item);

          return (
            <li
              key={item.name}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1.5"
            >
              <div className="min-w-0">
                <div className="text-sm">{item.label}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">
                  {state.inherited
                    ? `${item.name} · через wildcard`
                    : item.name}
                </div>
              </div>
              <PermissionLevelControl
                item={item}
                level={state.level}
                label={`${group.label}: ${item.label}`}
                disabled={
                  readOnly || state.inherited || !!isLocked?.(item.name)
                }
                onChange={level =>
                  onChange(setLevel(value, group, item, level))
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
