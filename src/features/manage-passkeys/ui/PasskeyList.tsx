import { formatter } from "@shared/lib/utils";
import { Button, IconButton, Skeleton, Tooltip } from "@shared/ui";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useManagePasskeysVM } from "../model/useManagePasskeysVM";

const DEVICE_TYPE_LABEL: Record<string, string> = {
  singleDevice: "Ключ устройства",
  multiDevice: "Синхронизируемый ключ",
};

/** Passkeys пользователя: вход без пароля. */
export const PasskeyList: FC = observer(() => {
  const { supported, passkeys, isLoading, isAdding, add, remove } =
    useManagePasskeysVM();

  return (
    <div className="flex flex-col gap-4">
      {isLoading && passkeys.length === 0 ? (
        <Skeleton className="h-12 w-full" />
      ) : passkeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">Passkeys пока нет.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {passkeys.map(passkey => (
            <li
              key={passkey.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <KeyRound
                size={18}
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {DEVICE_TYPE_LABEL[passkey.deviceType] ?? passkey.deviceType}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Добавлен {formatter.date.format(passkey.createdAt)}
                  {passkey.lastUsed &&
                    ` · вход ${formatter.date.format(passkey.lastUsed)}`}
                </p>
              </div>
              <Tooltip content="Удалить passkey">
                <IconButton
                  aria-label="Удалить passkey"
                  variant="destructive"
                  onClick={() => remove(passkey.id)}
                >
                  <Trash2 size={15} />
                </IconButton>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
      {supported ? (
        <Button
          variant="outline"
          className="self-start"
          leftIcon={<Plus size={15} />}
          loading={isAdding}
          onClick={add}
        >
          Добавить passkey
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Браузер не поддерживает passkeys.
        </p>
      )}
    </div>
  );
});
