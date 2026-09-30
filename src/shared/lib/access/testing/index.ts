import { hasPermission, type Permission, scopeIn } from "../permission-grammar";

interface IFakeAccessOptions {
  /** id текущего пользователя; `null` — пользователь не загружен. */
  userId?: string | null;
  permissions?: Permission[];
}

/**
 * Стор текущего пользователя для тестов: реальные правила прав (wildcard,
 * область «все / свои», владельцы). Полный доступ — право `*`.
 */
export const createFakeAccess = ({
  userId = "u1",
  permissions = [],
}: IFakeAccessOptions = {}) => {
  const scope = (permission: Permission) => scopeIn(permissions, permission);

  return {
    user: userId === null ? null : { id: userId },
    roles: [] as string[],
    permissions,
    isAdmin: false,
    accessKey: [userId, ...permissions].join("|"),
    can: (permission: Permission) => hasPermission(permissions, permission),
    scope,
    canOn: (
      permission: Permission,
      owners: ReadonlyArray<string | null | undefined>,
    ) => {
      const level = scope(permission);

      return (
        level === "all" ||
        (level === "own" && userId !== null && owners.includes(userId))
      );
    },
  };
};
