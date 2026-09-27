import { ChangeEmailForm } from "@features/change-email";
import { ChangePasswordForm } from "@features/change-password";
import { DeleteAccountButton } from "@features/delete-account";
import { PasskeyList } from "@features/manage-passkeys";
import { SessionList } from "@features/manage-sessions";
import { TwoFactorSettings } from "@features/manage-two-factor";
import { SetUsernameForm } from "@features/set-username";
import { Card, PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

const header = (
  <PageHeader
    title="Безопасность"
    subtitle="Вход, пароли, устройства и аккаунт"
  />
);

export const SecurityPage: FC = () => (
  <PageLayout header={header}>
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Card
          title="Пароль"
          description="После смены остальные сессии завершатся"
        >
          <ChangePasswordForm />
        </Card>
        <Card title="Email" description="Новый адрес подтверждается кодом">
          <ChangeEmailForm />
        </Card>
        <Card
          title="Имя пользователя"
          description="По нему вас находят другие пользователи"
        >
          <SetUsernameForm />
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card
          title="Двухфакторная защита"
          description="Второй пароль при входе"
        >
          <TwoFactorSettings />
        </Card>
        <Card title="Passkeys" description="Вход без пароля">
          <PasskeyList />
        </Card>
      </div>
    </div>
    <Card title="Сессии" description="Устройства, где выполнен вход">
      <SessionList />
    </Card>
    <Card title="Удаление аккаунта" description="Действие необратимо">
      <DeleteAccountButton />
    </Card>
  </PageLayout>
);
