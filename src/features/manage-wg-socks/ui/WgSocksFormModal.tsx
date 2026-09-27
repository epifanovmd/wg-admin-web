import {
  Button,
  Form,
  InputFormField,
  Modal,
  ModalContent,
  NumberInputFormField,
  PLAIN_NUMBER_FORMAT,
  SelectFormField,
  SwitchFormField,
  TextareaFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { TWgSocksForm, WgSocksFormVM } from "../model/useWgSocksFormVM";

const TITLES = {
  create: "Новый прокси",
  edit: "Прокси",
} as const;

interface WgSocksFormModalProps {
  vm: WgSocksFormVM;
}

/** Модалка создания и редактирования прокси; открывается методами VM. */
export const WgSocksFormModal: FC<WgSocksFormModalProps> = observer(
  ({ vm }) => (
    <Modal open={vm.open} onOpenChange={vm.setOpen}>
      <ModalContent
        size="lg"
        title={
          vm.editing ? `${TITLES.edit} ${vm.editing.name}` : TITLES[vm.mode]
        }
        description="SOCKS5 через mTLS: TLS только с клиентским сертификатом, затем логин и пароль"
        footer={
          <>
            <Button variant="outline" onClick={() => vm.setOpen(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-socks-form"
              loading={vm.form.formState.isSubmitting}
            >
              {vm.mode === "edit" ? "Сохранить" : "Создать"}
            </Button>
          </>
        }
      >
        <Form
          id="wg-socks-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_140px]">
            <InputFormField<TWgSocksForm>
              name="name"
              label="Название"
              placeholder="telegram"
            />
            <SelectFormField<TWgSocksForm>
              name="nodeId"
              label="Нода"
              options={vm.nodeOptions}
              disabled={vm.mode === "edit"}
              description="Где агент поднимет прокси"
            />
            <NumberInputFormField<TWgSocksForm>
              name="listenPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт на ноде"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <InputFormField<TWgSocksForm>
              name="clientHost"
              label="Адрес для клиентов"
              placeholder="по умолчанию — publicHost ноды"
              description="Если клиенты ходят через TCP-проброс на другой ноде — её адрес"
            />
            <NumberInputFormField<TWgSocksForm>
              name="clientPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт для клиентов"
              placeholder="как на ноде"
            />
          </div>

          {vm.mode === "edit" && (
            <SwitchFormField<TWgSocksForm>
              name="enabled"
              label="Включён"
              description="Выключенный прокси агент останавливает сразу"
            />
          )}
          <TextareaFormField<TWgSocksForm>
            name="description"
            label="Описание"
            rows={2}
          />
        </Form>
      </ModalContent>
    </Modal>
  ),
);
