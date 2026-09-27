import { SignUpForm } from "@features/sign-up";
import { FC } from "react";

interface SignUpPageProps {
  onSuccess: () => void;
  onSignIn: () => void;
}

export const SignUpPage: FC<SignUpPageProps> = props => (
  <SignUpForm {...props} />
);
