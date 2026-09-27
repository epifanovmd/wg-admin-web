import { ResetPasswordForm } from "@features/reset-password";
import { FC } from "react";

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordPage: FC<ResetPasswordPageProps> = ({
  token,
  onSuccess,
}) => <ResetPasswordForm token={token} onSuccess={onSuccess} />;
