import type { IWgAgentKeyDto } from "@shared/api/gen/main/model";
import { Alert, CopyableText } from "@shared/ui";
import { FC } from "react";

interface AgentKeyInstructionsProps {
  issued: IWgAgentKeyDto;
}

/** Выданный ключ агента и команда ручной установки на VPS с ним. */
export const AgentKeyInstructions: FC<AgentKeyInstructionsProps> = ({
  issued,
}) => (
  <div className="flex flex-col gap-3">
    <Alert variant="warning">
      Ключ показывается один раз. Установка через SSH из админки выпустит новый
      ключ сама; для установки вручную выполните команду на VPS (Linux с
      systemd, от root). Команда же переустанавливает агента с новым ключом.
    </Alert>
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">Установка вручную</span>
      <CopyableText
        text={issued.installCommand}
        className="break-all text-left font-mono text-sm"
      />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">Ключ агента</span>
      <CopyableText
        text={issued.agentKey}
        className="break-all font-mono text-sm"
      />
    </div>
  </div>
);
