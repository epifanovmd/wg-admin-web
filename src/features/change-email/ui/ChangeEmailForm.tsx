import { Button, Form, InputFormField } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useChangeEmailVM } from "../model/useChangeEmailVM";
import { TEmailCodeForm, TNewEmailForm } from "../model/validation";

export const ChangeEmailForm: FC = observer(() => {
  const {
    currentEmail,
    pendingEmail,
    emailForm,
    codeForm,
    requestChange,
    confirm,
    cancel,
  } = useChangeEmailVM();

  if (pendingEmail) {
    return (
      <Form form={codeForm} onSubmit={confirm} className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Введите код из письма, отправленного на{" "}
          <span className="font-medium text-foreground">{pendingEmail}</span>.
        </p>
        <InputFormField<TEmailCodeForm>
          name="code"
          label="Код подтверждения"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={codeForm.formState.isSubmitting}>
            Подтвердить
          </Button>
          <Button variant="outline" onClick={cancel}>
            Отмена
          </Button>
        </div>
      </Form>
    );
  }

  return (
    <Form
      form={emailForm}
      onSubmit={requestChange}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-muted-foreground">
        Текущий адрес:{" "}
        <span className="font-medium text-foreground">
          {currentEmail ?? "не указан"}
        </span>
      </p>
      <InputFormField<TNewEmailForm>
        name="email"
        label="Новый email"
        type="email"
        autoComplete="email"
      />
      <Button
        type="submit"
        className="self-start"
        loading={emailForm.formState.isSubmitting}
      >
        Получить код
      </Button>
    </Form>
  );
});
