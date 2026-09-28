import { INotificationService } from "@shared/lib/notifications";
import { Empty, PageLoader } from "@shared/ui";
import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, PropsWithChildren, useEffect } from "react";

import type { Permission } from "../lib/permissions";
import { IUserStore } from "../model/types";

interface PermissionGateProps {
  /** Право или список прав: достаточно любого из них. */
  permission: Permission | Permission[];
}

/**
 * Раздел по праву. Без права (в том числе отозванного на открытой странице)
 * содержимое скрывается, пользователь уходит на главную с уведомлением.
 */
export const PermissionGate: FC<PropsWithChildren<PermissionGateProps>> =
  observer(({ permission, children }) => {
    const userStore = IUserStore.useInstance();
    const toast = INotificationService.useInstance();
    const navigate = useNavigate();
    const permissions = Array.isArray(permission) ? permission : [permission];
    const denied =
      !!userStore.user && !permissions.some(item => userStore.can(item));

    useEffect(() => {
      if (!denied) return;

      toast.warning("Для этого раздела нужны дополнительные права.", {
        title: "Нет доступа",
      });
      void navigate({ to: "/", replace: true });
    }, [denied, navigate, toast]);

    if (!userStore.user) {
      return userStore.error ? (
        <Empty icon="error" title={userStore.error} />
      ) : (
        <PageLoader label="Проверка доступа…" />
      );
    }

    if (denied) {
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
