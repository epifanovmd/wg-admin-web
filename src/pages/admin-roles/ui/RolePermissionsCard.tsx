import { PermissionPicker } from "@entities/permission";
import { ALL_PERMISSIONS } from "@entities/user";
import { type IRoleDto, KnownRole } from "@shared/api/gen/main/model";
import { pluralize } from "@shared/lib/utils";
import { Button, Card, IconButton, Tooltip } from "@shared/ui";
import { Trash2 } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface RolePermissionsCardProps {
  role: IRoleDto;
  /** Менять права роли. */
  canUpdate: boolean;
  canDelete: boolean;
  /** Выдавать полный доступ «*» (только суперпользователь). */
  canGrantAll: boolean;
  onSave: (role: IRoleDto, permissions: string[]) => Promise<boolean>;
  onDelete: (role: IRoleDto) => void;
}

const namesOf = (role: IRoleDto) => role.permissions.map(p => p.name);

/** Встроенные роли: на них опирается сервер, удалять их нельзя. */
const SYSTEM_ROLES = new Set<string>(Object.values(KnownRole));

const PERMISSION_WORDS = { one: "право", few: "права", many: "прав" };

/** Права одной роли: отметки правятся локально и сохраняются кнопкой. */
export const RolePermissionsCard: FC<RolePermissionsCardProps> = ({
  role,
  canUpdate,
  canDelete,
  canGrantAll,
  onSave,
  onDelete,
}) => {
  const [selected, setSelected] = useState<string[]>(() => namesOf(role));
  const [saving, setSaving] = useState(false);

  useEffect(() => setSelected(namesOf(role)), [role]);

  const saved = namesOf(role);
  const dirty =
    selected.length !== saved.length || selected.some(p => !saved.includes(p));

  const toggle = (name: string, on: boolean) =>
    setSelected(list =>
      on ? [...list, name] : list.filter(permission => permission !== name),
    );

  const save = async () => {
    setSaving(true);
    await onSave(role, selected);
    setSaving(false);
  };

  return (
    <Card
      title={<span className="font-mono">{role.name}</span>}
      description={pluralize(role.permissions.length, PERMISSION_WORDS, true)}
      extra={
        canDelete &&
        !SYSTEM_ROLES.has(role.name) && (
          <Tooltip content={`Удалить роль ${role.name}`}>
            <IconButton
              aria-label={`Удалить роль ${role.name}`}
              variant="destructive"
              onClick={() => onDelete(role)}
            >
              <Trash2 size={15} />
            </IconButton>
          </Tooltip>
        )
      }
      footer={
        canUpdate && (
          <Button size="sm" disabled={!dirty} loading={saving} onClick={save}>
            Сохранить
          </Button>
        )
      }
    >
      <PermissionPicker
        selected={selected}
        onToggle={toggle}
        readOnly={!canUpdate}
        isLocked={name => name === ALL_PERMISSIONS && !canGrantAll}
      />
    </Card>
  );
};
