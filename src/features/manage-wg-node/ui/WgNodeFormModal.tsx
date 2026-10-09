import {
  Button,
  Form,
  InputFormField,
  Modal,
  ModalContent,
  TextareaFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { TWgNodeForm, WgNodeFormVM } from "../model/useWgNodeFormVM";
import { AgentInstallInstructions } from "./AgentInstallInstructions";

interface WgNodeFormModalProps {
  vm: WgNodeFormVM;
}

/** Модалка создания и редактирования ноды; открывается методами VM. */
export const WgNodeFormModal: FC<WgNodeFormModalProps> = observer(({ vm }) => (
  <Modal open={vm.open} onOpenChange={vm.setOpen}>
    <ModalContent
      size="md"
      title={
        vm.issued
          ? "Нода создана"
          : vm.editing
            ? "Изменение ноды"
            : "Новая нода"
      }
      description={
        vm.issued ? undefined : "VPS, на котором работает агент WireGuard"
      }
      footer={
        vm.issued ? (
          <Button onClick={() => vm.setOpen(false)}>Готово</Button>
        ) : (
          <>
            <Button variant="outline" onClick={() => vm.setOpen(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-node-form"
              loading={vm.form.formState.isSubmitting}
            >
              {vm.editing ? "Сохранить" : "Создать"}
            </Button>
          </>
        )
      }
    >
      {vm.issued ? (
        <AgentInstallInstructions install={vm.issued} />
      ) : (
        <Form
          id="wg-node-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <InputFormField<TWgNodeForm>
            name="name"
            label="Название"
            placeholder="Германия #1"
          />
          <InputFormField<TWgNodeForm>
            name="publicHost"
            label="Публичный хост"
            placeholder="203.0.113.10 или vpn.example.com"
            description="Адрес подключения клиентов по умолчанию (если не задана точка подключения)"
          />
          <TextareaFormField<TWgNodeForm>
            name="description"
            label="Описание"
            rows={2}
          />
        </Form>
      )}
    </ModalContent>
  </Modal>
));
