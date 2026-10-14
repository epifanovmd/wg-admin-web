import { formatter } from "@shared/lib/utils";
import {
  Alert,
  Button,
  CopyableText,
  CopyButton,
  Form,
  InputFormField,
  NumberInputFormField,
  PLAIN_NUMBER_FORMAT,
} from "@shared/ui";
import { Download, FileText, Link2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { type TIssueTarget, useIssueAgentVM } from "../model/useIssueAgentVM";
import { platformLabel, type TIssueAgentForm } from "../model/validation";

interface AgentIssuePanelProps {
  /** Нода — токен с меткой ноды, агент привяжется к ней; без ноды — просто агент. */
  target: TIssueTarget;
}

/** Команды получателя после распаковки архива (воркер wg настраивает узел — нужен root). */
const runHints = (compose: boolean): string[] => [
  "tar xzf <архив> && cd agent",
  "sudo ./agent install --env prod     # служба",
  ...(compose
    ? ["docker compose up -d --build        # Docker, в сети узла"]
    : []),
  "sudo ./agent run --env prod         # на месте, без установки",
];

/**
 * Архив агента для получателя: архив (все платформы, нужная выбирается при запуске) с `.env`
 * (адрес, одноразовый токен, имя) — файлом или одноразовой ссылкой; только `.env` — для общего
 * архива или образа.
 */
export const AgentIssuePanel: FC<AgentIssuePanelProps> = observer(
  ({ target }) => {
    const vm = useIssueAgentVM(target);
    const archive = vm.options?.archive;
    const compose = !!archive?.compose;

    if (vm.options && !archive) {
      return (
        <Alert variant="warning">
          На сервере нет архивов агента (AGENT_BUNDLE_DIR) — их собирает образ
          API или make agent-archive.
        </Alert>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Архив — агент, настройки и воркеры проекта; в выданный архив добавлен
          .env с адресом сервера и одноразовым токеном. Получатель распаковывает
          его и запускает как удобно: службой, на месте или в Docker.
        </p>
        {archive && (
          <p className="text-sm">
            {archive.file}
            {archive.platforms.length > 0 &&
              ` — ${archive.platforms.map(platformLabel).join(", ")}`}
          </p>
        )}
        <Form
          form={vm.form}
          onSubmit={vm.downloadArchive}
          className="flex flex-col gap-4"
        >
          <InputFormField<TIssueAgentForm>
            name="name"
            label="Имя агента"
            placeholder="vps-01"
            description="Пусто — имя машины"
          />
          <NumberInputFormField<TIssueAgentForm>
            name="expiresInMinutes"
            label="Срок токена, минут"
            formatOptions={PLAIN_NUMBER_FORMAT}
          />
          {!vm.forNode && (
            <NumberInputFormField<TIssueAgentForm>
              name="maxUses"
              label="Сколько машин зарегистрируется"
              description="Для архива одной машине — 1"
              formatOptions={PLAIN_NUMBER_FORMAT}
            />
          )}
          <InputFormField<TIssueAgentForm>
            name="baseUrl"
            label="Адрес сервера для агента"
            placeholder="https://api.example.com"
            description={`Пусто — ${vm.options?.server ?? "публичный адрес сервера"}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              leftIcon={<Download size={15} />}
              loading={vm.busy === "archive"}
            >
              Скачать архив
            </Button>
            <Button
              type="button"
              variant="outline"
              leftIcon={<Link2 size={15} />}
              loading={vm.busy === "link"}
              onClick={() => void vm.form.handleSubmit(vm.createLink)()}
            >
              Ссылка для передачи
            </Button>
            <Button
              type="button"
              variant="outline"
              leftIcon={<FileText size={15} />}
              loading={vm.busy === "env"}
              onClick={() => void vm.form.handleSubmit(vm.createEnv)()}
            >
              Только .env
            </Button>
          </div>
        </Form>
        {vm.link && (
          <div className="flex flex-col gap-2">
            <Alert variant="warning">
              Ссылка срабатывает один раз и до{" "}
              {formatter.date.format(new Date(vm.link.expiresAt).toISOString())}
              : архив с токеном собирается при скачивании.
            </Alert>
            <CopyableText
              text={vm.link.url}
              className="break-all font-mono text-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton
                variant="ghost"
                size="sm"
                text={`curl -fsSL '${vm.link.url}' | tar -xz && cd agent`}
              >
                Скопировать команду скачивания
              </CopyButton>
            </div>
          </div>
        )}
        {vm.env && (
          <div className="flex flex-col gap-2">
            <Alert variant="warning">
              Токен показывается только сейчас и действует до{" "}
              {formatter.date.format(new Date(vm.env.expiresAt).toISOString())}.
              Положите файл как agent/.env в распакованный архив или передайте
              образу (--env-file).
            </Alert>
            <pre className="overflow-auto whitespace-pre-wrap break-all rounded-lg bg-muted p-3 text-xs">
              {vm.env.env}
            </pre>
            <div className="flex flex-wrap items-center gap-2">
              <CopyButton variant="ghost" size="sm" text={vm.env.env} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Download size={15} />}
                onClick={vm.downloadEnv}
              >
                Скачать .env
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">У получателя</span>
          <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
            {runHints(compose).join("\n")}
          </pre>
        </div>
      </div>
    );
  },
);
