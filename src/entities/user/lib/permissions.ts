import { KnownRole } from "@shared/api/gen/main/model";

/** Право — строка `домен:действие` или wildcard `домен:*`. */
export type Permission = string;

/** Полный доступ. */
export const ALL_PERMISSIONS = "*";

/** Права администрирования (подписи и группы — в каталоге с сервера). */
export const ADMIN_PERMISSIONS = {
  USER_VIEW: "user:view",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_PRIVILEGES: "user:privileges",
  ROLE_VIEW: "role:view",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  PROFILE_VIEW: "profile:view",
  PROFILE_UPDATE: "profile:update",
  PROFILE_DELETE: "profile:delete",
  APIKEY_VIEW: "apikey:view",
  APIKEY_CREATE: "apikey:create",
  APIKEY_REVOKE: "apikey:revoke",
  AUDIT_VIEW: "audit:view",
} as const;

/**
 * Есть ли право с учётом wildcard-иерархии:
 * `wg:peer:create` ← `wg:peer:*` ← `wg:*` ← `*`.
 */
const hasPermission = (
  userPerms: readonly Permission[],
  required: Permission,
): boolean => {
  if (userPerms.includes(ALL_PERMISSIONS) || userPerms.includes(required)) {
    return true;
  }

  const parts = required.split(":");

  for (let i = parts.length - 1; i >= 1; i--) {
    if (userPerms.includes([...parts.slice(0, i), "*"].join(":"))) return true;
  }

  return false;
};

/** Роль admin — полный доступ. */
export const isAdminRole = (roles: readonly string[]): boolean =>
  roles.includes(KnownRole.admin);

/** Доступ: роль admin или право (с wildcard). */
export const canAccess = (
  roles: readonly string[],
  userPerms: readonly Permission[],
  required: Permission,
): boolean => isAdminRole(roles) || hasPermission(userPerms, required);

/** Эффективные права: права ролей ∪ прямые права. */
export const computeEffectivePermissions = (
  rolePermissions: readonly Permission[],
  directPermissions: readonly Permission[],
): Permission[] =>
  Array.from(new Set([...rolePermissions, ...directPermissions]));
