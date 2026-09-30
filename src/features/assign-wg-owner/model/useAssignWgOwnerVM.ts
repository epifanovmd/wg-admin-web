import { IMainApi } from "@shared/api";
import { useCollection } from "@shared/lib/holders";
import {
  type ApiError,
  type ApiResponse,
  notifyApiError,
} from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import type { SelectOption } from "@shared/ui";
import { useState } from "react";

/** Что назначается: подпись и вызовы API конкретной сущности. */
export interface IAssignWgOwnerTarget<T> {
  /** Подпись в заголовке: «нода alpha», «интерфейс wg0». */
  title: string;
  /** Текущий владелец (у пира — держатель). */
  ownerId: string | null;
  assign: (userId: string) => Promise<ApiResponse<T, ApiError>>;
  revoke: () => Promise<ApiResponse<T, ApiError>>;
}

interface UseAssignWgOwnerOptions<T> {
  onSaved: (entity: T) => void;
}

/**
 * Назначение и снятие владельца WG-сущности: выбор пользователя и вызов
 * assign/revoke той сущности, для которой открыто окно.
 */
export const useAssignWgOwnerVM = <T>({
  onSaved,
}: UseAssignWgOwnerOptions<T>) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [target, setTarget] = useState<IAssignWgOwnerTarget<T> | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);

  const users = useCollection<SelectOption, boolean>({
    queryFn: async () => {
      const { data, error } = await api.getUserOptions();

      return {
        data:
          data?.data.map(option => ({
            value: option.id,
            label: option.name ?? option.id,
          })) ?? null,
        error,
      };
    },
    enabled: target !== null,
    watch: [target !== null],
  });

  const openFor = (next: IAssignWgOwnerTarget<T>) => {
    setUserId(next.ownerId);
    setTarget(next);
  };

  const close = () => setTarget(null);

  const save = async () => {
    if (!target) return;
    if (userId === target.ownerId) {
      close();

      return;
    }

    setSaving(true);

    const res = userId ? await target.assign(userId) : await target.revoke();

    setSaving(false);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    onSaved(res.data);
    toast.success(userId ? "Владелец назначен" : "Владелец снят");
    close();
  };

  return {
    target,
    userId,
    setUserId,
    userOptions: users.items,
    isLoadingUsers: users.isLoading,
    isSaving,
    openFor,
    close,
    save,
  };
};

/** Что нужно окну выбора владельца: без типа сущности. */
export interface AssignWgOwnerVM {
  readonly target: { title: string } | null;
  readonly userId: string | null;
  setUserId(userId: string | null): void;
  readonly userOptions: SelectOption[];
  readonly isLoadingUsers: boolean;
  readonly isSaving: boolean;
  close(): void;
  save(): Promise<void>;
}
