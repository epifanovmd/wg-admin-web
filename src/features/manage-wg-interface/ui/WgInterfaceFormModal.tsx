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
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type {
  TWgInterfaceForm,
  WgInterfaceFormVM,
} from "../model/useWgInterfaceFormVM";

interface WgInterfaceFormModalProps {
  vm: WgInterfaceFormVM;
}

/** Модалка создания и редактирования интерфейса; открывается методами VM. */
export const WgInterfaceFormModal: FC<WgInterfaceFormModalProps> = observer(
  ({ vm }) => (
    <Modal open={vm.open} onOpenChange={vm.setOpen}>
      <ModalContent
        size="lg"
        title={vm.editing ? `Интерфейс ${vm.editing.name}` : "Новый интерфейс"}
        description="Ключи генерируются на сервере; агент применит изменения сам"
        footer={
          <>
            <Button variant="outline" onClick={() => vm.setOpen(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              form="wg-interface-form"
              loading={vm.form.formState.isSubmitting}
            >
              {vm.editing ? "Сохранить" : "Создать"}
            </Button>
          </>
        }
      >
        <Form
          id="wg-interface-form"
          form={vm.form}
          onSubmit={vm.submit}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <InputFormField<TWgInterfaceForm>
              name="name"
              label="Имя интерфейса"
              placeholder="wg0"
            />
            <NumberInputFormField<TWgInterfaceForm>
              name="listenPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TWgInterfaceForm>
              name="addressCidr"
              label="Подсеть IPv4"
              placeholder="10.8.0.1/24"
              description="Адрес интерфейса; пиры получают адреса из этой подсети"
            />
            <InputFormField<TWgInterfaceForm>
              name="addressV6Cidr"
              label="Подсеть IPv6 (необязательно)"
              placeholder="fd00:8::1/64"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TWgInterfaceForm>
              name="dns"
              label="DNS клиентов"
              placeholder="1.1.1.1, 8.8.8.8"
            />
            <NumberInputFormField<TWgInterfaceForm>
              name="mtu"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="MTU (необязательно)"
            />
          </div>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_140px]">
            <SelectFormField<TWgInterfaceForm>
              name="endpointId"
              label="Точка подключения"
              options={vm.endpointOptions}
              placeholder="publicHost ноды"
              description="Адрес и порт в конфигах клиентов; пустой порт — как у интерфейса"
            />
            <NumberInputFormField<TWgInterfaceForm>
              name="endpointPort"
              formatOptions={PLAIN_NUMBER_FORMAT}
              label="Порт на точке"
              placeholder="авто"
            />
          </div>
          <SwitchFormField<TWgInterfaceForm>
            name="natEnabled"
            label="NAT (masquerade)"
            description="Пускать трафик пиров в интернет через ноду"
          />
        </Form>
      </ModalContent>
    </Modal>
  ),
);
