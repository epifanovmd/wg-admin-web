import { Button, Separator } from "@shared/ui";
import { Fingerprint } from "lucide-react";
import { FC } from "react";

import { PasskeyLoginProps } from "./passkey-login.types";

/** Альтернативный вход по passkey с разделителем «или». */
export const PasskeyLogin: FC<PasskeyLoginProps> = ({ loading, onLogin }) => (
  <>
    <Separator label="или" />
    <Button
      type="button"
      variant="outline"
      className="w-full"
      loading={loading}
      leftIcon={<Fingerprint size={16} />}
      onClick={onLogin}
    >
      Войти с passkey
    </Button>
  </>
);
