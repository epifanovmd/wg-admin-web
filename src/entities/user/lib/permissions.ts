import { KnownPermission, KnownRole } from "@shared/api/gen/main/model";

/**
 * Проверяет наличие права с поддержкой wildcard-иерархии.
 * Иерархия wildcards: "chat:manage" → "chat:*" → "*".
 */
const hasPermission = (
  userPerms: KnownPermission[],
  required: KnownPermission | (string & {}),
): boolean => {
  if (userPerms.includes(KnownPermission["*"])) return true;
  if (userPerms.includes(required as KnownPermission)) return true;

  const parts = required.split(":");

  for (let i = parts.length - 1; i >= 1; i--) {
    const wildcard = [...parts.slice(0, i), "*"].join(":") as KnownPermission;

    if (userPerms.includes(wildcard)) return true;
  }

  return false;
};

/** Возвращает true, если пользователь имеет роль admin (superadmin bypass). */
export const isAdminRole = (roles: KnownRole[]): boolean =>
  roles.includes(KnownRole.admin);

/** Проверяет доступ: admin bypass ИЛИ конкретное право. */
export const canAccess = (
  roles: KnownRole[],
  userPerms: KnownPermission[],
  required: KnownPermission | (string & {}),
): boolean => isAdminRole(roles) || hasPermission(userPerms, required);

/** Вычисляет effective permissions = union(rolePermissions) ∪ directPermissions. */
export const computeEffectivePermissions = (
  rolePermissions: KnownPermission[],
  directPermissions: KnownPermission[],
): KnownPermission[] =>
  Array.from(new Set([...rolePermissions, ...directPermissions]));

/** Человеческие подписи известных прав — для экранов администрирования. */
export const PERMISSION_LABELS: Record<KnownPermission, string> = {
  "*": "Все права",
  "user:view": "Просмотр пользователей",
  "user:manage": "Управление пользователями",
  "role:view": "Просмотр ролей",
  "role:manage": "Управление ролями",
  "profile:view": "Просмотр профилей",
  "profile:manage": "Управление профилями",
  "apikey:manage": "Управление API-ключами",
  "audit:view": "Просмотр журнала",
};

/** Все известные права в порядке показа. */
export const KNOWN_PERMISSIONS = Object.keys(
  PERMISSION_LABELS,
) as KnownPermission[];
