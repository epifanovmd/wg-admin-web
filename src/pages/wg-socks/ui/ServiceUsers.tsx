import { WgToggleSwitch } from "@entities/wg";
import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { Badge, Button, IconButton, Tooltip } from "@shared/ui";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgSocksVM } from "../model/useWgSocksVM";

interface ServiceSectionProps {
  vm: WgSocksVM;
  service: WgSocksServiceDto;
}

/** Пользователи SOCKS5 прокси: пароль, включение, удаление. */
export const ServiceUsers: FC<ServiceSectionProps> = observer(
  ({ vm, service }) => (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Пользователи SOCKS5</h3>
        {vm.canManageUsers && (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus size={14} />}
            onClick={() => vm.namePrompt.open({ kind: "user", service })}
          >
            Пользователь
          </Button>
        )}
      </div>
      {service.users.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Нет пользователей — без логина прокси никого не пустит.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {service.users.map(user => (
            <li key={user.id} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-sm">
                {user.username}
              </span>
              {!user.enabled && <Badge variant="muted">выключен</Badge>}
              {vm.canViewSecrets && (
                <Tooltip content="Пароль и ссылка для Telegram">
                  <IconButton
                    aria-label="Пароль"
                    onClick={() => void vm.showSecret(service, user)}
                  >
                    <KeyRound size={15} />
                  </IconButton>
                </Tooltip>
              )}
              {vm.canManageUsers && (
                <>
                  <WgToggleSwitch
                    enabled={user.enabled}
                    onToggle={() => vm.toggleUser(service, user)}
                  />
                  <Tooltip content="Удалить">
                    <IconButton
                      aria-label="Удалить пользователя"
                      variant="destructive"
                      onClick={() => void vm.removeUser(service, user)}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  ),
);
