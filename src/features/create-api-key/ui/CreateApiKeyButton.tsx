import type { ApiKeyDto } from "@shared/api/gen/main/model";
import {
  Alert,
  Button,
  CopyableText,
  DatePickerFormField,
  Form,
  InputFormField,
  Modal,
  ModalContent,
} from "@shared/ui";
import { Plus } from "lucide-react";
import { FC } from "react";

import {
  TCreateApiKeyForm,
  useCreateApiKeyVM,
} from "../model/useCreateApiKeyVM";

interface CreateApiKeyButtonProps {
  onCreated: (apiKey: ApiKeyDto) => void;
}

export const CreateApiKeyButton: FC<CreateApiKeyButtonProps> = ({
  onCreated,
}) => {
  const { open, setOpen, openDialog, form, submit, secret } = useCreateApiKeyVM(
    { onCreated },
  );

  return (
    <>
      <Button leftIcon={<Plus size={15} />} onClick={openDialog}>
        Новый ключ
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          size="md"
          title={secret ? "Ключ создан" : "Новый API-ключ"}
          description={secret ? undefined : "Для внешних воркеров и интеграций"}
          footer={
            secret ? (
              <Button onClick={() => setOpen(false)}>Готово</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button
                  type="submit"
                  form="create-api-key-form"
                  loading={form.formState.isSubmitting}
                >
                  Создать
                </Button>
              </>
            )
          }
        >
          {secret ? (
            <div className="flex flex-col gap-3">
              <Alert variant="warning">
                Скопируйте ключ сейчас — повторно он не показывается.
              </Alert>
              <CopyableText
                text={secret}
                className="break-all font-mono text-sm"
              />
            </div>
          ) : (
            <Form
              id="create-api-key-form"
              form={form}
              onSubmit={submit}
              className="flex flex-col gap-4"
            >
              <InputFormField<TCreateApiKeyForm>
                name="name"
                label="Название"
                placeholder="monitoring"
              />
              <InputFormField<TCreateApiKeyForm>
                name="scopes"
                label="Scopes через запятую"
                placeholder="worker:*"
              />
              <DatePickerFormField<TCreateApiKeyForm>
                name="expiresAt"
                label="Действует до (необязательно)"
                minDate={new Date()}
                clearable
              />
            </Form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
