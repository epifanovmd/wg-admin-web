import { ForgotPasswordForm } from "@features/forgot-password";
import { FC } from "react";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export const ForgotPasswordPage: FC<ForgotPasswordPageProps> = props => (
  <ForgotPasswordForm {...props} />
);
