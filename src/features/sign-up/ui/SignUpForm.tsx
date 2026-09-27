import { IAuthStore } from "@entities/auth";
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormSubmit,
  InputFormField,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useSignUpVM } from "../model/useSignUpVM";
import { TSignUpForm } from "../model/validation";

/** Текстовая ссылка формы в фирменном цвете. */
const AUTH_LINK_CLASS = "text-brand";

interface SignUpFormProps {
  onSuccess: () => void;
  onSignIn: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = observer(
  ({ onSuccess, onSignIn }) => {
    const auth = IAuthStore.useInstance();
    const { form, handleSignUp } = useSignUpVM(onSuccess);

    return (
      <Card className="p-6">
        <CardHeader className="mb-6 p-0 md:p-0">
          <CardTitle className="text-xl font-bold">Создать аккаунт</CardTitle>
          <CardDescription>Заполните данные для регистрации</CardDescription>
        </CardHeader>

        <Form
          form={form}
          onSubmit={handleSignUp}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <InputFormField<TSignUpForm> name="firstName" label="Имя" />
            <InputFormField<TSignUpForm> name="lastName" label="Фамилия" />
          </div>
          <InputFormField<TSignUpForm>
            name="login"
            label="Логин / Email"
            type="email"
            required
          />
          <InputFormField<TSignUpForm>
            name="password"
            label="Пароль"
            type="password"
            rules={{ deps: "confirmPassword" }}
            required
          />
          <InputFormField<TSignUpForm>
            name="confirmPassword"
            label="Подтверждение пароля"
            type="password"
            required
          />
          <FormSubmit loading={auth.isLoading} className="w-full">
            Создать аккаунт
          </FormSubmit>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Button
            variant="link"
            size="sm"
            className={AUTH_LINK_CLASS}
            onClick={onSignIn}
          >
            Войти
          </Button>
        </p>
      </Card>
    );
  },
);
