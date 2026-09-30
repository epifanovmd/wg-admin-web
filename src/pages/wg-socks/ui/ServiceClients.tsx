import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { Badge, Button, IconButton, Tooltip } from "@shared/ui";
import { Apple, Ban, Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgSocksVM } from "../model/useWgSocksVM";

interface ServiceSectionProps {
  vm: WgSocksVM;
  service: WgSocksServiceDto;
}

/** Устройства прокси (клиентские сертификаты): клиент для Mac, отзыв. */
export const ServiceClients: FC<ServiceSectionProps> = observer(
  ({ vm, service }) => {
    const firstUser = service.users.find(user => user.enabled);

    return (
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Устройства (сертификаты)</h3>
          {vm.accessOf(service).canManageClients && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus size={14} />}
              onClick={() => vm.namePrompt.open({ kind: "client", service })}
            >
              Устройство
            </Button>
          )}
        </div>
        {service.clients.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Нет устройств — выпустите сертификат, чтобы скачать клиент.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {service.clients.map(client => (
              <li key={client.id} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{client.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {client.fingerprint.slice(0, 16)}…
                  </p>
                </div>
                {client.revoked ? (
                  <Badge variant="destructive">отозван</Badge>
                ) : (
                  vm.accessOf(service).canManageClients && (
                    <>
                      <Tooltip
                        content={
                          firstUser
                            ? `Готовый клиент для Mac (логин ${firstUser.username})`
                            : "Сначала добавьте пользователя"
                        }
                      >
                        <span className="inline-flex">
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Apple size={14} />}
                            disabled={!firstUser}
                            onClick={() =>
                              void vm.downloadMac(
                                service,
                                client,
                                firstUser?.id,
                              )
                            }
                          >
                            Клиент для Mac
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip content="Отозвать сертификат">
                        <IconButton
                          aria-label="Отозвать"
                          variant="destructive"
                          onClick={() => void vm.revokeClient(service, client)}
                        >
                          <Ban size={15} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  },
);
