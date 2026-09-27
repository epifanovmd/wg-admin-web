import { cn } from "@shared/lib/utils";
import { LogOut } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

import { useSignOut } from "../model/useSignOut";

export interface SignOutButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  onBeforeSignOut?: () => void;
}

export const SignOutButton: FC<SignOutButtonProps> = ({
  className,
  onClick,
  onBeforeSignOut,
  ...props
}) => {
  const signOut = useSignOut();

  return (
    <button
      type="button"
      className={cn("flex items-center gap-2.5", className)}
      onClick={event => {
        onBeforeSignOut?.();
        signOut();
        onClick?.(event);
      }}
      {...props}
    >
      <LogOut size={16} />
      Выйти
    </button>
  );
};
