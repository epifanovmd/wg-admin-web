import { IMainApi } from "@shared/api";
import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

interface DeleteWgSocksOptions {
  onDeleted: (service: WgSocksServiceDto) => void;
}

/** Удаление прокси с подтверждением. Возвращает, удалено ли. */
export const useDeleteWgSocks = ({ onDeleted }: DeleteWgSocksOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  return async (service: WgSocksServiceDto): Promise<boolean> => {
    const ok = await confirm({
      title: `Удалить прокси «${service.name}»?`,
      description:
        "Агент остановит прокси сразу, все выданные сертификаты и пароли перестанут работать.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return false;

    const res = await api.deleteWgSocks(service.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onDeleted(service);

    return true;
  };
};
