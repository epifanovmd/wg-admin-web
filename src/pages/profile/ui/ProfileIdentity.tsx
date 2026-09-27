import { UserAvatar } from "@entities/user";
import { Badge } from "@shared/ui";
import { FC } from "react";

import { ProfileIdentityProps } from "./profile-identity.types";

export const ProfileIdentity: FC<ProfileIdentityProps> = ({
  name,
  login,
  roleLabel,
  emailVerified,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-4">
      <UserAvatar name={name} size="xl" />
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold leading-tight text-foreground">
          {name}
        </h2>
        {login && (
          <p className="truncate text-sm text-muted-foreground">{login}</p>
        )}
      </div>
    </div>

    {(roleLabel || emailVerified !== undefined) && (
      <div className="flex flex-wrap items-center gap-1.5">
        {roleLabel && <Badge variant="secondary">{roleLabel}</Badge>}
        {emailVerified !== undefined && (
          <Badge variant={emailVerified ? "success" : "secondary"} dot>
            {emailVerified ? "Email подтверждён" : "Email не подтверждён"}
          </Badge>
        )}
      </div>
    )}
  </div>
);
