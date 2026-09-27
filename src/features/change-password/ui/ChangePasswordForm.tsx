import { Button, Form, InputFormField } from "@shared/ui";
import { FC } from "react";

import { useChangePasswordVM } from "../model/useChangePasswordVM";
import { TChangePasswordForm } from "../model/validation";

export const ChangePasswordForm: FC = () => {
  const { form, submit } = useChangePasswordVM();

  return (
    <Form form={form} onSubmit={submit} className="flex flex-col gap-4">
      <InputFormField<TChangePasswordForm>
        name="currentPassword"
        label="Текущий пароль"
        type="password"
        autoComplete="current-password"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputFormField<TChangePasswordForm>
          name="newPassword"
          label="Новый пароль"
          type="password"
          autoComplete="new-password"
        />
        <InputFormField<TChangePasswordForm>
          name="confirmPassword"
          label="Повторите пароль"
          type="password"
          autoComplete="new-password"
        />
      </div>
      <Button
        type="submit"
        className="self-start"
        loading={form.formState.isSubmitting}
      >
        Сменить пароль
      </Button>
    </Form>
  );
};
