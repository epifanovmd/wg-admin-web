import {
  Button,
  Form,
  InputFormField,
  SegmentedFormField,
  SwitchFormField,
  TextareaFormField,
} from "@shared/ui";
import { KeyRound } from "lucide-react";
import { FC } from "react";

import type { EnrollAgentVM } from "../model/useEnrollAgentVM";
import {
  type TEnrollmentTokenForm,
  TOKEN_EXPIRY_OPTIONS,
} from "../model/validation";

interface EnrollmentTokenFormProps {
  vm: EnrollAgentVM;
}

const EXPIRY_OPTIONS = TOKEN_EXPIRY_OPTIONS.map(({ value, label }) => ({
  value,
  label,
}));

/** Создание токена регистрации: название, срок, одноразовость, метки. */
export const EnrollmentTokenForm: FC<EnrollmentTokenFormProps> = ({ vm }) => (
  <Form
    form={vm.tokenForm}
    onSubmit={vm.createToken}
    className="flex flex-col gap-4"
  >
    <InputFormField<TEnrollmentTokenForm>
      name="name"
      label="Название"
      placeholder="Например: узлы в зоне eu"
    />
    <SegmentedFormField<TEnrollmentTokenForm>
      name="expiry"
      label="Срок действия"
      options={EXPIRY_OPTIONS}
    />
    <SwitchFormField<TEnrollmentTokenForm>
      name="singleUse"
      label="Одноразовый"
      description="Зарегистрировать по нему можно только одного агента"
    />
    <TextareaFormField<TEnrollmentTokenForm>
      name="labels"
      label="Метки агентов"
      description="ключ=значение через запятую — их получат все агенты с этим токеном"
      placeholder="zone=eu, gpu=true"
      rows={2}
    />
    <Button
      type="submit"
      variant="outline"
      className="self-start"
      leftIcon={<KeyRound size={15} />}
      loading={vm.tokenForm.formState.isSubmitting}
    >
      Создать токен
    </Button>
  </Form>
);
