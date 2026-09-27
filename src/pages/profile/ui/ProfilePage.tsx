import { EditProfileModal } from "@features/edit-profile";
import { RequestEmailVerificationButton } from "@features/request-email-verification";
import { InfoFieldProps, PageHeader, PageLayout, PageLoader } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useProfileVM } from "../model/useProfileVM";
import { ProfileCard } from "./ProfileCard";

const header = (
  <PageHeader title="Мой профиль" subtitle="Личные данные профиля" />
);

export const ProfilePage: FC = observer(() => {
  const { model, profile, isEditOpen, openEdit, closeEdit } = useProfileVM();

  if (!model) {
    return (
      <PageLayout header={header}>
        <PageLoader label="Загрузка профиля…" />
      </PageLayout>
    );
  }

  const fields: InfoFieldProps[] = [
    { label: "Имя", value: profile?.firstName },
    { label: "Фамилия", value: profile?.lastName },
    { label: "Пол", value: profile?.gender },
    { label: "Дата рождения", value: model.birthDateModel.formattedDate },
    {
      label: "Email",
      value: model.email,
      action:
        model.email && !model.emailVerified ? (
          <RequestEmailVerificationButton />
        ) : undefined,
    },
    { label: "Телефон", value: model.phone },
  ];

  return (
    <PageLayout header={header}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <ProfileCard
          name={model.displayName}
          login={model.login}
          roleLabel={model.roleLabel}
          emailVerified={model.emailVerified}
          fields={fields}
          registeredAt={model.registeredAt}
          onEdit={openEdit}
        />
      </div>

      <EditProfileModal open={isEditOpen} onClose={closeEdit} />
    </PageLayout>
  );
});
