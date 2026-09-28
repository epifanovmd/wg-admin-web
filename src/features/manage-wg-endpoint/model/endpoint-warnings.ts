import type { IWgEndpointInterfaceDto } from "@shared/api/gen/main/model";

interface IEndpointShape {
  mode: "direct" | "relay";
  host: string;
  relayNodeId?: string | null;
  interfaces: IWgEndpointInterfaceDto[];
}

interface INodeAddress {
  id: string;
  name: string;
  publicHost: string | null;
}

/**
 * Настройки точки, которые почти наверняка ведут трафик не туда, куда
 * ожидается. Хост сравнивается с адресами нод буквально (DNS не разрешается).
 */
export const endpointWarnings = (
  endpoint: IEndpointShape,
  nodes: INodeAddress[],
): string[] => {
  const host = endpoint.host.trim();
  const hostNode = host
    ? nodes.find(node => node.publicHost === host)
    : undefined;
  const warnings: string[] = [];

  if (endpoint.mode === "relay") {
    if (
      hostNode &&
      endpoint.relayNodeId &&
      hostNode.id !== endpoint.relayNodeId
    ) {
      warnings.push(
        `Хост — адрес ноды «${hostNode.name}», а релей точки — другая нода: клиенты придут не на релей.`,
      );
    }

    return warnings;
  }

  const served = new Set(
    endpoint.interfaces.flatMap(target => [
      target.nodeId,
      ...target.copyNodeIds,
    ]),
  );

  if (hostNode && endpoint.interfaces.length > 0 && !served.has(hostNode.id)) {
    warnings.push(
      `Хост — нода «${hostNode.name}», а интерфейсов точки на ней нет. В режиме «Адрес ноды» панель через неё трафик не пересылает: если «${hostNode.name}» пересылает его вручную (проброс), копии и переключение не работают — выберите «Через релей панели» с релеем «${hostNode.name}».`,
    );
  }
  if (endpoint.interfaces.some(target => target.copyNodeIds.length > 0)) {
    warnings.push(
      "У интерфейсов точки есть копии, но в режиме «Адрес ноды» трафик на них сам не переключится — для этого нужен релей панели.",
    );
  }

  return warnings;
};
