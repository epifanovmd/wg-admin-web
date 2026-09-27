import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

/** Что добавляется: пользователь SOCKS5 или устройство (сертификат). */
export type TNamePromptKind = "user" | "client";

export interface INamePrompt {
  kind: TNamePromptKind;
  service: WgSocksServiceDto;
}

/** Длины — как у колонок бэкенда: логин SOCKS5 и имя сертификата. */
const MAX_LENGTH: Record<TNamePromptKind, number> = { user: 64, client: 120 };

const namePromptSchema = z
  .object({
    kind: z.enum(["user", "client"]),
    name: z.string().trim().min(1, "Введите имя."),
  })
  .refine(data => data.name.length <= MAX_LENGTH[data.kind], {
    message: "Слишком длинное имя.",
    path: ["name"],
  });

export type TNamePromptForm = z.input<typeof namePromptSchema>;

interface UseSocksNamePromptOptions {
  /** Создать пользователя или устройство; true — модалку можно закрыть. */
  onSubmit: (prompt: INamePrompt, name: string) => Promise<boolean>;
}

/** Модалка ввода имени нового пользователя или устройства прокси. */
export const useSocksNamePromptVM = ({
  onSubmit,
}: UseSocksNamePromptOptions) => {
  const [prompt, setPrompt] = useState<INamePrompt | null>(null);
  const form = useZodForm(namePromptSchema, {
    defaultValues: { kind: "user", name: "" },
  });

  const open = (next: INamePrompt) => {
    form.reset({ kind: next.kind, name: "" });
    setPrompt(next);
  };

  const close = () => setPrompt(null);

  const submit = async ({ name }: z.output<typeof namePromptSchema>) => {
    if (prompt && (await onSubmit(prompt, name))) close();
  };

  return { prompt, open, close, form, submit };
};

export type SocksNamePromptVM = ReturnType<typeof useSocksNamePromptVM>;
