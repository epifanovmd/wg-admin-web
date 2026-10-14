import type {
  IWgNodeInstallCommandDto,
  TWgNodeInstallMode,
} from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import { Alert, CopyableText } from "@shared/ui";
import { FC } from "react";

interface AgentInstallInstructionsProps {
  install: IWgNodeInstallCommandDto;
  /** Способ установки, под который выдана команда. */
  mode?: TWgNodeInstallMode;
}

const HOW: Record<TWgNodeInstallMode, string> = {
  systemd:
    "Выполните команду на VPS (Linux с systemd, от root): она поставит агента службой agent-wg с воркерами wg и socks, и агент привяжется к этой ноде.",
  docker:
    "Выполните команду на VPS с Docker и compose: она скачает архив агента, создаст .env с адресом и токеном и запустит контейнер в сети узла (privileged) с воркерами wg и socks; агент привяжется к этой ноде. Обновление — новым архивом.",
};

/** Команда установки агента с одноразовым токеном регистрации ноды. */
export const AgentInstallInstructions: FC<AgentInstallInstructionsProps> = ({
  install,
  mode = "systemd",
}) => (
  <div className="flex flex-col gap-3">
    <Alert variant="warning">
      Токен показывается один раз и действует до{" "}
      {formatter.date.format(install.expiresAt)}. {HOW[mode]} Установка по SSH
      из админки создаст токен сама.
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
