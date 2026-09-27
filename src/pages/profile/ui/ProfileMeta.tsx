import { FC } from "react";

import { ProfileMetaProps } from "./profile-meta.types";

export const ProfileMeta: FC<ProfileMetaProps> = ({ registeredAt }) => {
  if (!registeredAt) return null;

  return (
    <div className="text-xs text-muted-foreground">
      Зарегистрирован: {registeredAt}
    </div>
  );
};
