import { IMainApi } from "@shared/api";
import type { WgEndpointDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

interface DeleteWgEndpointOptions {
  onDeleted: (endpoint: WgEndpointDto) => void;
}

/** Удаление точки подключения с подтверждением. Возвращает, удалено ли. */
export const useDeleteWgEndpoint = ({ onDeleted }: DeleteWgEndpointOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  return async (endpoint: WgEndpointDto): Promise<boolean> => {
    const ok = await confirm({
      title: `Удалить точку подключения «${endpoint.name}»?`,
      description: "Точка, которую используют интерфейсы, не удалится.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return false;

    const res = await api.deleteWgEndpoint(endpoint.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    onDeleted(endpoint);

    return true;
  };
};
