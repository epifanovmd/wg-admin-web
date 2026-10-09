import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

/** Состояние интерфейса после перезапуска воркером wg. */
const INTERFACE_RESTART_STATUS: Record<string, { label: string; ok: boolean }> =
  {
    up: { label: "поднят", ok: true },
    down: { label: "не поднят", ok: false },
    error: { label: "ошибка", ok: false },
  };

interface UseWgInterfaceActionsOptions {
  /** Интерфейс изменился (ответ сервера или локальная правка). */
  onChanged: (iface: WgInterfaceDto) => void;
  /** Интерфейс удалён. */
  onDeleted: (iface: WgInterfaceDto) => void;
}

/**
 * Действия с интерфейсом: включение, перезапуск, удаление, закрепление и
 * снятие реплики. Общие для страницы ноды и страницы интерфейса.
 */
export const useWgInterfaceActions = ({
  onChanged,
  onDeleted,
}: UseWgInterfaceActionsOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  const toggle = async (iface: WgInterfaceDto): Promise<boolean> => {
    const res = iface.enabled
      ? await api.disableWgInterface(iface.id)
      : await api.enableWgInterface(iface.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onChanged(res.data);

    return true;
  };

  const restart = async (iface: WgInterfaceDto) => {
    const res = await api.restartWgInterface(iface.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    const view = INTERFACE_RESTART_STATUS[res.data.status];

    if (view?.ok === false) {
      toast.warning(`Интерфейс ${iface.name} перезапущен: ${view.label}`);
    } else {
      toast.success(
        `Интерфейс ${iface.name} перезапущен${view ? `: ${view.label}` : ""}`,
      );
    }
  };

  const remove = async (iface: WgInterfaceDto): Promise<boolean> => {
    const ok = await confirm({
      title: `Удалить интерфейс «${iface.name}»?`,
      description: "Сначала должны быть удалены его пиры.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return false;

    const res = await api.deleteWgInterface(iface.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onDeleted(iface);

    return true;
  };

  const pinReplica = async (iface: WgInterfaceDto, pinned: string | null) => {
    const res = await api.updateWgInterface(iface.id, {
      activeReplicaNodeId: pinned,
    });

    if (res.error) notifyApiError(toast, res.error);
    else onChanged(res.data);
  };

  const removeReplica = async (
    iface: WgInterfaceDto,
    replicaNodeId: string,
  ) => {
    const replica = iface.replicas.find(r => r.nodeId === replicaNodeId);
    const ok = await confirm({
      title: `Убрать копию «${iface.name}» с ноды «${replica?.nodeName ?? "—"}»?`,
      description:
        "Агент ноды снимет интерфейс; релей перестанет слать туда трафик.",
      confirmLabel: "Убрать",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.removeWgInterfaceReplica(iface.id, replicaNodeId);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    onChanged({
      ...iface,
      replicas: iface.replicas.filter(r => r.nodeId !== replicaNodeId),
      activeReplicaNodeId:
        iface.activeReplicaNodeId === replicaNodeId
          ? null
          : iface.activeReplicaNodeId,
    });
  };

  return { toggle, restart, remove, pinReplica, removeReplica };
};
