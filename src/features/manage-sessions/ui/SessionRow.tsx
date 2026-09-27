import type { SessionModel } from "@entities/user";
import { formatter } from "@shared/lib/utils";
import { Badge, Button } from "@shared/ui";
import { Monitor } from "lucide-react";
import { FC } from "react";

interface SessionRowProps {
  session: SessionModel;
  current: boolean;
  terminating: boolean;
  onTerminate: (id: string) => void;
}

export const SessionRow: FC<SessionRowProps> = ({
  session,
  current,
  terminating,
  onTerminate,
}) => (
  <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <Monitor size={18} aria-hidden className="shrink-0 text-muted-foreground" />
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
        {session.deviceName}
        {current && <Badge variant="success">Это устройство</Badge>}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {session.data.ip ?? "IP неизвестен"} · активность{" "}
        {formatter.date.format(session.data.lastActiveAt)}
      </p>
    </div>
    {!current && (
      <Button
        size="sm"
        variant="outline"
        loading={terminating}
        onClick={() => onTerminate(session.data.id)}
      >
        Завершить
      </Button>
    )}
  </li>
);
