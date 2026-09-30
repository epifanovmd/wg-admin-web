import type { IPermissionCatalogItemDto } from "@shared/api/gen/main/model";
import { Segmented, type SegmentedOption, Switch } from "@shared/ui";
import { FC } from "react";

import type { PermissionLevel } from "../lib/permission-levels";

interface PermissionLevelControlProps {
  item: IPermissionCatalogItemDto;
  level: PermissionLevel;
  disabled: boolean;
  /** Подпись для скринридера: группа и действие. */
  label: string;
  onChange: (level: PermissionLevel) => void;
}

const SCOPED_OPTIONS: SegmentedOption<PermissionLevel>[] = [
  { value: "none", label: "Нет" },
  { value: "own", label: "Свои" },
  { value: "all", label: "Все" },
];

/** Уровень действия: «Нет / Свои / Все» для действий с областью, иначе вкл/выкл. */
export const PermissionLevelControl: FC<PermissionLevelControlProps> = ({
  item,
  level,
  disabled,
  label,
  onChange,
}) =>
  item.own ? (
    <Segmented<PermissionLevel>
      size="sm"
      aria-label={label}
      options={SCOPED_OPTIONS}
      value={level}
      disabled={disabled}
      onValueChange={onChange}
    />
  ) : (
    <Switch
      aria-label={label}
      checked={level === "all"}
      disabled={disabled}
      onCheckedChange={on => onChange(on ? "all" : "none")}
    />
  );
