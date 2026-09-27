import type { EWgLinkStatus, IWgLinkHealth } from "@shared/api/gen/main/model";
import { Badge, type BadgeProps, Card } from "@shared/ui";
import { FC } from "react";

const STATUS: Record<
  EWgLinkStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  ok: { label: "Работает", variant: "success" },
  degraded: { label: "Потери", variant: "warning" },
  down: { label: "Не отвечает", variant: "destructive" },
  unknown: { label: "Нет данных", variant: "secondary" },
};

/** IPIP-туннели релеев ноды: RTT и потери по пробам агентов (раз в ~10 с). */
export const NodeLinksCard: FC<{ links: IWgLinkHealth[] }> = ({ links }) => {
  if (links.length === 0) return null;

  return (
    <Card title="Туннели" description="Проверка IPIP-линков релеев">
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 gap-y-2 text-sm">
        {links.map(link => {
          const status = STATUS[link.status];

          return (
            <div key={link.linkId} className="contents">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {link.counterpartName ?? link.counterpartNodeId}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span>
                    {link.role === "relay"
                      ? "эта нода — релей"
                      : "релей для этой ноды"}
                  </span>
                  {" · "}
                  <span className="font-mono">{link.tunnelName}</span>
                </p>
              </div>
              <span className="font-mono">
                {link.rttMs !== null ? `${link.rttMs} мс` : "—"}
              </span>
              <span className="font-mono">
                {link.lossPercent !== null ? `${link.lossPercent}%` : "—"}
              </span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
