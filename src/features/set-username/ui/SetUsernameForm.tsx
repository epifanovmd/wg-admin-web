import { Button, Form, InputFormField } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useSetUsernameVM } from "../model/useSetUsernameVM";
import { TUsernameForm } from "../model/validation";

export const SetUsernameForm: FC = observer(() => {
  const { form, submit } = useSetUsernameVM();

  return (
    <Form form={form} onSubmit={submit} className="flex flex-col gap-3">
      <InputFormField<TUsernameForm>
        name="username"
        label="Имя пользователя"
        placeholder="john_doe"
        prefix="@"
      />
      <Button
        type="submit"
        className="self-start"
        disabled={!form.formState.isDirty}
        loading={form.formState.isSubmitting}
      >
        Сохранить
      </Button>
    </Form>
  );
});
