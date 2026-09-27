import { IMainApi } from "@shared/api";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

interface DeleteWgNodeOptions {
  onDeleted: (node: WgNodeDto) => void;
}

/** Удаление ноды с подтверждением. Возвращает, удалено ли. */
export const useDeleteWgNode = ({ onDeleted }: DeleteWgNodeOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  return async (node: WgNodeDto): Promise<boolean> => {
    const ok = await confirm({
      title: `Удалить ноду «${node.name}»?`,
      description: "Ключ агента будет отозван.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return false;

    const res = await api.deleteWgNode(node.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onDeleted(node);

    return true;
  };
};
