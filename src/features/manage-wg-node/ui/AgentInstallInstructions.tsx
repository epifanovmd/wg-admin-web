import type { IWgNodeInstallCommandDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import { Alert, CopyableText } from "@shared/ui";
import { FC } from "react";

interface AgentInstallInstructionsProps {
  install: IWgNodeInstallCommandDto;
}

/** Команда установки агента с одноразовым токеном регистрации ноды. */
export const AgentInstallInstructions: FC<AgentInstallInstructionsProps> = ({
  install,
}) => (
  <div className="flex flex-col gap-3">
    <Alert variant="warning">
      Токен показывается один раз и действует до{" "}
      {formatter.date.format(install.expiresAt)}. Выполните команду на VPS
      (Linux с systemd, от root): она поставит агента службой agent-wg с
      воркерами wg и socks, и агент привяжется к этой ноде. Установка по SSH из
      админки выпустит токен сама.
    </Alert>
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">Команда установки</span>
      <CopyableText
        text={install.command}
        className="break-all text-left font-mono text-sm"
      />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">
        Токен регистрации (одноразовый)
      </span>
      <CopyableText
        text={install.token}
        className="break-all font-mono text-sm"
      />
    </div>
  </div>
);
