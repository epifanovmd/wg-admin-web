import { useWgNodeOptions } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useState } from "react";

/** Перенос на другую ноду или копия (реплика) на ещё одной ноде. */
export type TWgInterfaceCopyMode = "move" | "copy";

interface UseMoveWgInterfaceVMOptions {
  onMoved: (iface: WgInterfaceDto) => void;
}

/** Нода копии без агента: копия поднимется только после его установки. */
const AWAITING_AGENT = new Set(["created", "provisioning"]);

const successMessage = (
  mode: TWgInterfaceCopyMode,
  name: string,
  result: WgInterfaceDto,
  nodeId: string,
) => {
  if (mode === "move") return `Интерфейс ${name} перенесён`;

  const replica = result.replicas?.find(copy => copy.nodeId === nodeId);

  return replica?.nodeStatus && AWAITING_AGENT.has(replica.nodeStatus)
    ? `Копия ${name} добавлена — поднимется, когда на ноде будет установлен агент`
    : `Копия ${name} добавлена`;
};

/**
 * Перенос интерфейса или его копия на другой ноде: ключ и пиры сохраняются,
 * у реплик набор пиров всегда тот же, что у основной копии.
 */
export const useMoveWgInterfaceVM = ({
  onMoved,
}: UseMoveWgInterfaceVMOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [iface, setIface] = useState<WgInterfaceDto | null>(null);
  const [mode, setMode] = useState<TWgInterfaceCopyMode>("move");
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nodes = useWgNodeOptions({ enabled: iface !== null });
  // Ни перенести, ни скопировать туда, где копия уже есть.
  const taken = new Set(
    iface
      ? [iface.nodeId, ...(iface.replicas ?? []).map(replica => replica.nodeId)]
      : [],
  );

  const openFor = (
    target: WgInterfaceDto,
    nextMode: TWgInterfaceCopyMode = "move",
  ) => {
    setMode(nextMode);
    setIface(target);
    setNodeId(null);
  };

  const submit = async () => {
    if (!iface || !nodeId) return;

    setSubmitting(true);

    const res =
      mode === "copy"
        ? await api.addWgInterfaceReplica(iface.id, { nodeId })
        : await api.moveWgInterface(iface.id, { nodeId });

    setSubmitting(false);
    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    toast.success(successMessage(mode, iface.name, res.data, nodeId));
    setIface(null);
    onMoved(res.data);
  };

  return {
    mode,
    iface,
    open: iface !== null,
    close: () => setIface(null),
    openFor,
    nodeId,
    setNodeId,
    /** Getter: список нод — observable, читается там, где рисуется. */
    get options() {
      return nodes.items.filter(option => !taken.has(option.value));
    },
    submit,
    submitting,
    /** Перенос без точки подключения меняет адрес в клиентских конфигах. */
    changesClientConfigs: mode === "move" && !!iface && !iface.endpointId,
    /** Копия без точки подключения не получит трафик через релей. */
    copyWithoutEndpoint: mode === "copy" && !!iface && !iface.endpointId,
  };
};

export type MoveWgInterfaceVM = ReturnType<typeof useMoveWgInterfaceVM>;
