import { SignInForm } from "@features/sign-in";
import { FC } from "react";

interface SignInPageProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export const SignInPage: FC<SignInPageProps> = props => (
  <SignInForm {...props} />
);
