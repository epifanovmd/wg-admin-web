import { Button, Form, InputFormField, Segmented } from "@shared/ui";
import { FC } from "react";

import { TwoFactorMode, useTwoFactorVM } from "../model/useTwoFactorVM";
import {
  TDisableTwoFactorForm,
  TEnableTwoFactorForm,
} from "../model/validation";

const MODE_OPTIONS = [
  { value: "enable" as const, label: "Включить" },
  { value: "disable" as const, label: "Отключить" },
];

export const TwoFactorSettings: FC = () => {
  const { mode, setMode, enableForm, disableForm, enable, disable } =
    useTwoFactorVM();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        После входа по паролю потребуется второй пароль. Подсказка к нему
        показывается на экране входа.
      </p>
      <Segmented<TwoFactorMode>
        size="sm"
        options={MODE_OPTIONS}
        value={mode}
        onValueChange={setMode}
      />

      {mode === "enable" ? (
        <Form
          form={enableForm}
          onSubmit={enable}
          className="flex flex-col gap-4"
        >
          <InputFormField<TEnableTwoFactorForm>
            name="currentPassword"
            label="Текущий пароль"
            type="password"
            autoComplete="current-password"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TEnableTwoFactorForm>
              name="password"
              label="Второй пароль"
              type="password"
              autoComplete="new-password"
            />
            <InputFormField<TEnableTwoFactorForm>
              name="confirmPassword"
              label="Повторите второй пароль"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <InputFormField<TEnableTwoFactorForm>
            name="hint"
            label="Подсказка (необязательно)"
          />
          <Button
            type="submit"
            className="self-start"
            loading={enableForm.formState.isSubmitting}
          >
            Включить 2FA
          </Button>
        </Form>
      ) : (
        <Form
          form={disableForm}
          onSubmit={disable}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputFormField<TDisableTwoFactorForm>
              name="currentPassword"
              label="Текущий пароль"
              type="password"
              autoComplete="current-password"
            />
            <InputFormField<TDisableTwoFactorForm>
              name="password"
              label="Второй пароль"
              type="password"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="self-start"
            loading={disableForm.formState.isSubmitting}
          >
            Отключить 2FA
          </Button>
        </Form>
      )}
    </div>
  );
};
