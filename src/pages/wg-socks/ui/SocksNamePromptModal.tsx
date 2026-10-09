import { Button, Form, InputFormField, Modal, ModalContent } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type {
  SocksNamePromptVM,
  TNamePromptForm,
} from "../model/useSocksNamePromptVM";

interface SocksNamePromptModalProps {
  vm: SocksNamePromptVM;
}

/** Имя нового пользователя (пароль генерируется) или устройства прокси. */
export const SocksNamePromptModal: FC<SocksNamePromptModalProps> = observer(
  ({ vm }) => {
    const isUser = vm.prompt?.kind === "user";

    return (
      <Modal open={!!vm.prompt} onOpenChange={open => !open && vm.close()}>
        <ModalContent
          size="sm"
          title={isUser ? "Новый пользователь" : "Новое устройство"}
          description={
            isUser
              ? "Пароль сгенерируется автоматически"
              : "Создастся клиентский сертификат, подписанный CA прокси"
          }
          footer={
            <>
              <Button variant="outline" onClick={vm.close}>
                Отмена
              </Button>
              <Button
                type="submit"
                form="wg-socks-name-form"
                loading={vm.form.formState.isSubmitting}
              >
                {isUser ? "Добавить" : "Создать"}
              </Button>
            </>
          }
        >
          <Form id="wg-socks-name-form" form={vm.form} onSubmit={vm.submit}>
            <InputFormField<TNamePromptForm>
              name="name"
              label={isUser ? "Логин" : "Название устройства"}
              placeholder={isUser ? "telegram" : "macbook"}
              autoFocus
            />
          </Form>
        </ModalContent>
      </Modal>
    );
  },
);
