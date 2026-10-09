import {
  Alert,
  Button,
  Form,
  InputFormField,
  Modal,
  ModalContent,
  NumberInputFormField,
  PLAIN_NUMBER_FORMAT,
  TextareaFormField,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

import {
  TProvisionForm,
  useProvisionWgNodeVM,
} from "../model/useProvisionWgNodeVM";

type ProvisionVM = ReturnType<typeof useProvisionWgNodeVM>;

interface ProvisionWgNodeModalProps {
  vm: ProvisionVM;
}

const TEXT = {
  install: {
    title: "Установка агента",
    description:
      "Агент службой agent-wg с воркерами wg и socks, пакеты WireGuard и параметры ядра — автоматически",
    submit: "Установить",
    started:
      "Установка запущена. Нода выйдет на связь сама, как только агент запустится; прогресс — на карточке ноды.",
  },
  uninstall: {
    title: "Удаление агента",
    description:
      "Воркеры снимут свои интерфейсы, туннели, пробросы и прокси; служба agent-wg, программа, настройки и поставленные установкой пакеты будут удалены. Другие агенты на хосте не затрагиваются.",
    submit: "Удалить агента",
    started:
      "Удаление запущено. После него агент будет отозван, нода вернётся в статус «Ожидает агента».",
  },
} as const;

/** Установка или удаление агента на VPS по SSH. */
export const ProvisionWgNodeModal: FC<ProvisionWgNodeModalProps> = ({ vm }) => (
  <Modal open={vm.node !== null} onOpenChange={open => !open && vm.close()}>
    <ModalContent
      size="md"
      title={`${TEXT[vm.mode].title}: ${vm.node?.name ?? ""}`}
      description={TEXT[vm.mode].description}
      footer={
        vm.jobId ? (
          <>
            <Button variant="outline" onClick={vm.close}>
              Закрыть
            </Button>
            <Button asChild>
              <Link to="/jobs">К задачам</Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={vm.close}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-provision-form"
              variant={vm.mode === "uninstall" ? "destructive" : undefined}
              loading={vm.form.formState.isSubmitting}
            >
              {TEXT[vm.mode].submit}
            </Button>
          </>
        )
      }
    >
      {vm.jobId ? (
        <Alert variant="success">{TEXT[vm.mode].started}</Alert>
      ) : (
        <Form
          id="wg-provision-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
            <InputFormField<TProvisionForm>
              name="host"
              label="SSH-хост"
              placeholder="203.0.113.10"
            />
            <NumberInputFormField<TProvisionForm>
              name="port"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт"
            />
          </div>
          <InputFormField<TProvisionForm>
            name="username"
            label="Пользователь"
            description="Не root — потребуется sudo без пароля"
          />
          <TextareaFormField<TProvisionForm>
            name="privateKey"
            label="Приватный SSH-ключ (PEM)"
            rows={4}
            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
          />
          <InputFormField<TProvisionForm>
            name="password"
            label="Пароль SSH (если нет ключа)"
            type="password"
          />
          {vm.mode === "install" && (
            <InputFormField<TProvisionForm>
              name="backendUrl"
              label="URL бэкенда для агента"
              placeholder="по умолчанию — публичный URL приложения"
            />
          )}
          <Alert variant="info">
            SSH-данные используются один раз и в открытом виде не сохраняются.
          </Alert>
        </Form>
      )}
    </ModalContent>
  </Modal>
);
