import type { IWgEndpointInterfaceDto } from "@shared/api/gen/main/model";
import { FC } from "react";

interface EndpointTargetsProps {
  interfaces: IWgEndpointInterfaceDto[];
}

const copiesLabel = (count: number) =>
  count === 1 ? "1 копия" : count < 5 ? `${count} копии` : `${count} копий`;

/** Куда ведёт точка: порт клиентов → интерфейс на ноде, число копий. */
export const EndpointTargets: FC<EndpointTargetsProps> = ({ interfaces }) =>
  interfaces.length ? (
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
  ) : (
    <span className="text-xs text-muted-foreground">интерфейсов нет</span>
  );
