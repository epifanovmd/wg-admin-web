import { PASSKEY_LOGIN_STORAGE_KEY } from "@entities/auth";
import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type {
  PasskeyDto,
  RegistrationResponseJSON,
} from "@shared/api/gen/main/model";
import { useCollection, useMutation } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { IStorageService } from "@shared/lib/storage";
import { useConfirm } from "@shared/ui";
import {
  browserSupportsWebAuthn,
  type PublicKeyCredentialCreationOptionsJSON,
  startRegistration,
} from "@simplewebauthn/browser";

/** Сколько passkeys показывает список — у пользователя их единицы. */
const PASSKEYS_LIMIT = 50;

export const useManagePasskeysVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const storage = IStorageService.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();

  const list = useCollection<PasskeyDto>({
    queryFn: async () => {
      const { data, error } = await api.getPasskeys({ limit: PASSKEYS_LIMIT });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: p => p.id,
    autoLoad: true,
  });

  const add = useMutation<void, boolean>({
    mutationFn: async () => {
      const options = await api.generateRegistrationOptions();

      if (!options.data) return { data: null, error: options.error };

      let attestation: RegistrationResponseJSON;

      try {
        attestation = (await startRegistration({
          optionsJSON: options.data as PublicKeyCredentialCreationOptionsJSON,
        })) as RegistrationResponseJSON;
      } catch (e) {
        const error = e as Error;

        // Отмена системного диалога — не ошибка для пользователя.
        return {
          data: null,
          error: {
            message: error.message,
            isCanceled: error.name === "NotAllowedError",
          },
        };
      }

      const verified = await api.verifyRegistration({ data: attestation });

      return { data: verified.data?.verified ?? null, error: verified.error };
    },
    onSuccess: async () => {
      const login = userStore.user?.email ?? userStore.user?.phone;

      if (login) storage.setItem(PASSKEY_LOGIN_STORAGE_KEY, login);
      toast.success("Passkey добавлен");
      await list.refresh();
    },
    onError: error => notifyApiError(toast, error),
  });

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "Удалить passkey?",
      description: "Вход с этим ключом станет невозможен.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.deletePasskey(id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    list.removeItem(id);
  };

  return {
    supported: browserSupportsWebAuthn(),
    passkeys: list.items,
    isLoading: list.isLoading,
    isAdding: add.isLoading,
    add: () => add.mutate(),
    remove,
  };
};
