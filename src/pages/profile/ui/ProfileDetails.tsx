import { InfoField } from "@shared/ui";
import { FC } from "react";

import { ProfileDetailsProps } from "./profile-details.types";

export const ProfileDetails: FC<ProfileDetailsProps> = ({ fields }) => (
  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
    {fields.map((field, index) => (
      <InfoField key={index} {...field} className="bg-card" />
    ))}
  </div>
);
