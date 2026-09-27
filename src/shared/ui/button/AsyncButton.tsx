import * as React from "react";

import { type AsyncClickHandler, useAsyncClick } from "../foundation";
import { Button, type ButtonProps } from "./Button";

export interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Пока промис не завершится, кнопка в состоянии `loading`. */
  onClick?: AsyncClickHandler;
}

const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  ({ onClick, disabled = false, loading = false, ...props }, ref) => {
    const { loading: pending, handleClick } = useAsyncClick(
      onClick,
      disabled || loading,
    );

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        loading={loading || pending}
        {...props}
      />
    );
  },
);

AsyncButton.displayName = "AsyncButton";

export { AsyncButton };
