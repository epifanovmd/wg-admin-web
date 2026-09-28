import type { IWgEndpointInterfaceDto } from "@shared/api/gen/main/model";
import { Badge } from "@shared/ui";
import { FC } from "react";

interface EndpointTargetsProps {
  interfaces: IWgEndpointInterfaceDto[];
  /** Плотно, строками текста — для ячейки таблицы. */
  dense?: boolean;
}

const copiesLabel = (count: number) =>
  count === 1 ? "1 копия" : count < 5 ? `${count} копии` : `${count} копий`;

/** Куда ведёт точка: порт клиентов → интерфейс на ноде, число копий. */
export const EndpointTargets: FC<EndpointTargetsProps> = ({
  interfaces,
  dense = false,
}) => {
  if (!interfaces.length) {
    return (
      <span className="text-xs text-muted-foreground">
        {dense
          ? "интерфейсов нет"
          : "Через точку пока не подключён ни один интерфейс"}
      </span>
    );
  }

  if (dense) {
    return (
      <div className="flex flex-col gap-0.5 text-xs">
        {interfaces.map(target => (
          <p key={target.interfaceId} className="truncate">
            <span className="font-mono">:{target.port}</span>{" "}
            {target.interfaceName} → {target.nodeName ?? "—"}
            {target.copyNodeIds.length > 0 && (
              <span className="text-muted-foreground">
                {" "}
                · {copiesLabel(target.copyNodeIds.length)}
              </span>
            )}
          </p>
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {interfaces.map(target => (
        <li
          key={target.interfaceId}
          className="flex items-center justify-between gap-3 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm">
              <span className="font-medium">{target.interfaceName}</span>
              <span className="text-muted-foreground"> → </span>
              {target.nodeName ?? "—"}
            </p>
            {target.copyNodeIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {copiesLabel(target.copyNodeIds.length)}
              </p>
            )}
          </div>
          <Badge variant="outline" className="shrink-0 font-mono">
            udp/{target.port}
          </Badge>
        </li>
      ))}
    </ul>
  );
};
