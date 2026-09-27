import { Button } from "@shared/ui";
import { Check } from "lucide-react";
import { FC } from "react";

import { ForgotPasswordSuccessProps } from "./forgot-password-success.types";

/** Состояние «письмо отправлено» на экране восстановления пароля. */
export const ForgotPasswordSuccess: FC<ForgotPasswordSuccessProps> = ({
  onBack,
}) => (
  <div className="py-4 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
      <Check className="h-6 w-6 text-success" />
    </div>
    <h2 className="mb-2 text-lg font-bold text-foreground">
      Письмо отправлено
    </h2>
    <p className="mb-6 text-sm text-muted-foreground">
      Если аккаунт с таким email существует, вы получите ссылку для сброса
      пароля.
    </p>
    <Button type="button" variant="ghost" onClick={onBack}>
      Вернуться к входу
    </Button>
  </div>
);
