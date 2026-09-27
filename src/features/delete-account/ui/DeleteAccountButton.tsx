import { Button, Form, InputFormField, Modal, ModalContent } from "@shared/ui";
import { Trash2 } from "lucide-react";
import { FC } from "react";

import {
  TDeleteAccountForm,
  useDeleteAccountVM,
} from "../model/useDeleteAccountVM";

export const DeleteAccountButton: FC = () => {
  const { open, setOpen, openDialog, form, submit } = useDeleteAccountVM();

  return (
    <>
      <Button
        variant="destructive"
        leftIcon={<Trash2 size={15} />}
        onClick={openDialog}
      >
        Удалить аккаунт
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          size="sm"
          title="Удалить аккаунт?"
          description="Аккаунт и все данные будут удалены без возможности восстановления."
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button
                type="submit"
                form="delete-account-form"
                variant="destructive"
                loading={form.formState.isSubmitting}
              >
                Удалить навсегда
              </Button>
            </>
          }
        >
          <Form id="delete-account-form" form={form} onSubmit={submit}>
            <InputFormField<TDeleteAccountForm>
              name="password"
              label="Пароль для подтверждения"
              type="password"
              autoComplete="current-password"
            />
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
};
