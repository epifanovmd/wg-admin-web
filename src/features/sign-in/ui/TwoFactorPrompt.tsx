import { AsyncButton } from "@shared/ui";
import { FC } from "react";

import { TwoFactorPromptProps } from "./two-factor-prompt.types";

/** Блок подтверждения второго фактора при входе. */
export const TwoFactorPrompt: FC<TwoFactorPromptProps> = ({
  hint,
  onVerify,
}) => (
  <div className="flex flex-col gap-3 rounded-lg border border-brand/20 bg-brand/5 p-4">
    <p className="text-sm text-foreground">
      Требуется подтверждение второго фактора.{hint ? ` ${hint}` : ""}
    </p>
    <AsyncButton type="button" className="w-full" onClick={() => onVerify()}>
      Подтвердить вход
    </AsyncButton>
  </div>
);
