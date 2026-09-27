import {
  Alert,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormSubmit,
  InputFormField,
} from "@shared/ui";
import { FC } from "react";

import { useResetPasswordVM } from "../model/useResetPasswordVM";
import { TResetPasswordForm } from "../model/validation";

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({
  token,
  onSuccess,
}) => {
  const { form, submit, error } = useResetPasswordVM({
    token,
    onSuccess,
  });

  return (
    <Card className="p-6">
      <CardHeader className="mb-6 p-0 md:p-0">
        <CardTitle className="text-xl font-bold">Сброс пароля</CardTitle>
        <CardDescription>Введите новый пароль</CardDescription>
      </CardHeader>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      <Form form={form} onSubmit={submit} className="flex flex-col gap-4">
        <InputFormField<TResetPasswordForm>
          name="password"
          label="Новый пароль"
          type="password"
          placeholder="••••••••"
          rules={{ deps: "confirmPassword" }}
        />
        <InputFormField<TResetPasswordForm>
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          placeholder="••••••••"
        />
        <FormSubmit className="w-full">Установить пароль</FormSubmit>
      </Form>
    </Card>
  );
};
