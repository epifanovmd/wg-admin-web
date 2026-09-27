import { IMainApi } from "@shared/api";
import type {
  ICreatedWgNodeDto,
  IWgAgentKeyDto,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

const HOST = /^[a-zA-Z0-9.:_-]+$/;

export const wgNodeFormSchema = z.object({
  name: z.string().trim().min(1, "Введите название.").max(120),
  publicHost: z
    .string()
    .trim()
    .max(255)
    .regex(HOST, "Домен или IP-адрес.")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
});

export type TWgNodeForm = z.input<typeof wgNodeFormSchema>;

interface UseWgNodeFormOptions {
  onSaved: (node: WgNodeDto) => void;
}

/**
 * Создание и редактирование ноды. При создании сервер один раз возвращает
 * ключ агента — он показывается до закрытия модалки.
 */
export const useWgNodeFormVM = ({ onSaved }: UseWgNodeFormOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WgNodeDto | null>(null);
  const [issued, setIssued] = useState<IWgAgentKeyDto | null>(null);
  const form = useZodForm(wgNodeFormSchema);

  const openCreate = () => {
    setEditing(null);
    setIssued(null);
    form.reset({ name: "", publicHost: "", description: "" });
    setOpen(true);
  };

  const openEdit = (node: WgNodeDto) => {
    setEditing(node);
    setIssued(null);
    form.reset({
      name: node.name,
      publicHost: node.publicHost ?? "",
      description: node.description ?? "",
    });
    setOpen(true);
  };

  const submit = async (data: TWgNodeForm) => {
    const body = {
      name: data.name!,
      publicHost: data.publicHost || null,
      description: data.description || null,
    };
    const res = editing
      ? await api.updateWgNode(editing.id, body)
      : await api.createWgNode(body);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    if (editing) {
      onSaved(res.data as WgNodeDto);
      setOpen(false);

      return;
    }

    const created = res.data as ICreatedWgNodeDto;

    onSaved(created.node);
    setIssued(created);
  };

  return {
    open,
    setOpen,
    openCreate,
    openEdit,
    editing,
    issued,
    form,
    submit,
  };
};

export type WgNodeFormVM = ReturnType<typeof useWgNodeFormVM>;
