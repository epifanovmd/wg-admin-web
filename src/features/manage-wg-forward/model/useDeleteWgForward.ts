import { IMainApi } from "@shared/api";
import type { WgForwardDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

interface DeleteWgForwardOptions {
  onDeleted: (forward: WgForwardDto) => void;
}

/** Удаление проброса с подтверждением. Возвращает, удалено ли. */
export const useDeleteWgForward = ({ onDeleted }: DeleteWgForwardOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  return async (forward: WgForwardDto): Promise<boolean> => {
    const ok = await confirm({
      title: `Удалить проброс «${forward.name}»?`,
      description: "Агент релея снимет проброс сразу.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return false;

    const res = await api.deleteWgForward(forward.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onDeleted(forward);

    return true;
  };
};
