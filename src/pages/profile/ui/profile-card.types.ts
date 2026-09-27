import { InfoFieldProps } from "@shared/ui";

export interface ProfileCardProps {
  name: string;
  login?: string | null;
  roleLabel?: string;
  emailVerified?: boolean;
  fields: InfoFieldProps[];
  registeredAt?: string;
  onEdit: () => void;
}
