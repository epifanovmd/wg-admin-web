import { IAuthStore } from "@entities/auth";
import {
  Alert,
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

import { usePasskeyAuth } from "../model/usePasskeyAuth";
import { useSignInVM } from "../model/useSignInVM";
import { TSignInForm } from "../model/validation";
import { PasskeyLogin } from "./PasskeyLogin";
import { TwoFactorPrompt } from "./TwoFactorPrompt";

/** Текстовая ссылка формы в фирменном цвете. */
const AUTH_LINK_CLASS = "text-brand";

interface SignInFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export const SignInForm: FC<SignInFormProps> = observer(
  ({ onSuccess, onForgotPassword, onSignUp }) => {
    const auth = IAuthStore.useInstance();
    const { form, handleLogin } = useSignInVM(onSuccess);
    const passkey = usePasskeyAuth(onSuccess);

    const passkeyError = passkey.error ?? (auth.error || null);

    return (
      <Card className="p-6">
        <CardHeader className="mb-6 p-0 md:p-0">
          <CardTitle className="text-xl font-bold">Вход</CardTitle>
          <CardDescription>
            Войдите, чтобы управлять нодами и пирами WireGuard
          </CardDescription>
        </CardHeader>

        {passkeyError && (
          <Alert variant="destructive" className="mb-4">
            {passkeyError}
          </Alert>
        )}

        <Form
          form={form}
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >
          <InputFormField<TSignInForm>
            name="login"
            label="Email или телефон"
            placeholder="email@example.com"
          />
          <InputFormField<TSignInForm>
            name="password"
            label="Пароль"
            type="password"
            placeholder="••••••••"
          />

          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              className={AUTH_LINK_CLASS}
              onClick={onForgotPassword}
            >
              Забыли пароль?
            </Button>
          </div>

          {auth.isTwoFactorRequired ? (
            <TwoFactorPrompt
              hint={auth.twoFactorHint}
              onVerify={() => auth.verify2FA(form.getValues("password"))}
            />
          ) : (
            <FormSubmit className="w-full" loading={auth.isLoading}>
              Войти
            </FormSubmit>
          )}

          {!auth.isTwoFactorRequired &&
            passkey.support &&
            passkey.profileId && (
              <PasskeyLogin
                loading={passkey.loading}
                onLogin={passkey.handleLogin}
              />
            )}
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Button
            variant="link"
            size="sm"
            className={AUTH_LINK_CLASS}
            onClick={onSignUp}
          >
            Зарегистрироваться
          </Button>
        </p>
      </Card>
    );
  },
);
