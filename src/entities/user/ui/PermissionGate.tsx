import type { KnownPermission } from "@shared/api/gen/main/model";
import { Empty, PageLoader } from "@shared/ui";
import { Lock } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, PropsWithChildren } from "react";

import { IUserStore } from "../model/types";

type Permission = KnownPermission | (string & {});

interface PermissionGateProps {
  /** Право или список прав: достаточно любого из них. */
  permission: Permission | Permission[];
}

/** Показывает содержимое, только если у пользователя есть право. */
export const PermissionGate: FC<PropsWithChildren<PermissionGateProps>> =
  observer(({ permission, children }) => {
    const userStore = IUserStore.useInstance();

    if (!userStore.user) return <PageLoader label="Проверка доступа…" />;

    const permissions = Array.isArray(permission) ? permission : [permission];

    if (!permissions.some(item => userStore.can(item))) {
      return (
        <Empty
          icon={<Lock />}
          title="Нет доступа"
          description="Для этого раздела нужны дополнительные права."
        />
      );
    }

    return <>{children}</>;
  });
