import {
  Button,
  DatePickerFormField,
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

import type { TWgPeerForm, WgPeerFormVM } from "../model/useWgPeerFormVM";

interface WgPeerFormModalProps {
  vm: WgPeerFormVM;
}

/** Модалка создания и редактирования пира; открывается методами VM. */
export const WgPeerFormModal: FC<WgPeerFormModalProps> = observer(({ vm }) => (
  <Modal open={vm.open} onOpenChange={vm.setOpen}>
    <ModalContent
      size="lg"
      title={vm.editing ? `Пир ${vm.editing.name}` : "Новый пир"}
      description={
        vm.editing ? undefined : "Ключи и IP-адрес выделяются автоматически"
      }
      footer={
        <>
          <Button variant="outline" onClick={() => vm.setOpen(false)}>
            Отмена
          </Button>
          <Button
            type="submit"
            form="wg-peer-form"
            loading={vm.form.formState.isSubmitting}
          >
            {vm.editing ? "Сохранить" : "Создать"}
          </Button>
        </>
      }
    >
      <Form
        id="wg-peer-form"
        form={vm.form}
        onSubmit={vm.submit}
        className="flex flex-col gap-4"
      >
        {!vm.editing && (
          <SelectFormField<TWgPeerForm>
            name="interfaceId"
            label="Интерфейс"
            options={vm.interfaceOptions}
            clearable={false}
          />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputFormField<TWgPeerForm>
            name="name"
            label="Название"
            placeholder="Телефон Ивана"
          />
          {vm.canAssign && (
            <SelectFormField<TWgPeerForm>
              name="userId"
              label="Держатель"
              options={vm.userOptions}
              placeholder="не назначен"
              description="Пользователь увидит пир в своём списке"
            />
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputFormField<TWgPeerForm>
            name="clientAllowedIPs"
            label="AllowedIPs клиента"
            placeholder="0.0.0.0/0, ::/0"
            description="Какой трафик клиент направит в туннель (split tunnel)"
          />
          <InputFormField<TWgPeerForm>
            name="clientDns"
            label="DNS клиента"
            placeholder="как у интерфейса"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberInputFormField<TWgPeerForm>
            name="persistentKeepalive"
            formatOptions={PLAIN_NUMBER_FORMAT}
            label="Keepalive, с"
          />
          <DatePickerFormField<TWgPeerForm>
            name="expiresAt"
            label="Действует до"
            minDate={new Date()}
            clearable
          />
        </div>
        {!vm.editing && (
          <>
            <InputFormField<TWgPeerForm>
              name="publicKey"
              label="Импорт: публичный ключ клиента"
              placeholder="необязательно — иначе ключи создаст сервер"
              description="При импорте приватный ключ не хранится, конфиг и QR не создаются"
            />
            <SwitchFormField<TWgPeerForm>
              name="withPresharedKey"
              label="Preshared-ключ"
              description="Дополнительная защита (рекомендуется)"
            />
          </>
        )}
        <TextareaFormField<TWgPeerForm>
          name="description"
          label="Описание"
          rows={2}
        />
      </Form>
    </ModalContent>
  </Modal>
));
