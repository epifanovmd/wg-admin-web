import { IMainApi } from "@shared/api";
import type { ApiKeyDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const SCOPE = /^(\*|[a-z][a-z0-9_-]*(:[a-z0-9_.*/-]+)?)$/;

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1, "Введите название.").max(100),
  scopes: z
    .string()
    .transform(value => value.split(/[\s,]+/).filter(Boolean))
    .pipe(
      z
        .array(z.string().regex(SCOPE, "Неверный scope."))
        .min(1, "Укажите хотя бы один scope."),
    ),
  expiresAt: z.date().optional(),
});

export type TCreateApiKeyForm = z.input<typeof createApiKeySchema>;
type TCreateApiKeyValues = z.output<typeof createApiKeySchema>;

interface UseCreateApiKeyOptions {
  onCreated: (apiKey: ApiKeyDto) => void;
}

/** Создание ключа; секрет сервер отдаёт один раз — он показывается до закрытия. */
export const useCreateApiKeyVM = ({ onCreated }: UseCreateApiKeyOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const form = useZodForm(createApiKeySchema, {
    defaultValues: { name: "", scopes: "worker:*" },
  });

  const openDialog = () => {
    form.reset({ name: "", scopes: "worker:*", expiresAt: undefined });
    setSecret(null);
    setOpen(true);
  };

  const submit = async (data: TCreateApiKeyValues) => {
    const res = await api.createApiKey({
      name: data.name,
      scopes: data.scopes,
      expiresAt: data.expiresAt?.toISOString(),
    });

    if (!res.data) {
      notifyApiError(toast, res.error);

      return;
    }

    setSecret(res.data.key);
    onCreated(res.data.apiKey);
  };

  return { open, setOpen, openDialog, form, submit, secret };
};
