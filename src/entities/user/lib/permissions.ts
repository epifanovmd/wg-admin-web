import { KnownRole } from "@shared/api/gen/main/model";
import {
  type AccessScope,
  hasPermission,
  type Permission,
  scopeIn,
} from "@shared/lib/access";

export { ALL_PERMISSIONS, type Permission } from "@shared/lib/access";

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

/** Роль admin — полный доступ. */
export const isAdminRole = (roles: readonly string[]): boolean =>
  roles.includes(KnownRole.admin);

/** Доступ: роль admin или право (с wildcard). */
export const canAccess = (
  roles: readonly string[],
  userPerms: readonly Permission[],
  required: Permission,
): boolean => isAdminRole(roles) || hasPermission(userPerms, required);

/**
 * Область права: `all` — роль admin, само право или wildcard; `own` — только
 * `<право>:own`; `null` — права нет.
 */
export const resolveScope = (
  roles: readonly string[],
  userPerms: readonly Permission[],
  required: Permission,
): AccessScope | null =>
  isAdminRole(roles) ? "all" : scopeIn(userPerms, required);

/** Своя ли сущность: пользователь среди её владельцев (держатель, создатель). */
export const isOwnedBy = (
  userId: string | undefined,
  owners: ReadonlyArray<string | null | undefined>,
): boolean => !!userId && owners.includes(userId);

/** Эффективные права: права ролей ∪ прямые права. */
export const computeEffectivePermissions = (
  rolePermissions: readonly Permission[],
  directPermissions: readonly Permission[],
): Permission[] =>
  Array.from(new Set([...rolePermissions, ...directPermissions]));
