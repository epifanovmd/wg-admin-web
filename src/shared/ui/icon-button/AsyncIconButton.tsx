import * as React from "react";

import { type AsyncClickHandler, useAsyncClick } from "../foundation";
import { IconButton, type IconButtonProps } from "./IconButton";

export interface AsyncIconButtonProps extends Omit<IconButtonProps, "onClick"> {
  /** Пока промис не завершится, кнопка в состоянии `loading`. */
  onClick?: AsyncClickHandler;
}

const AsyncIconButton = React.forwardRef<
  HTMLButtonElement,
  AsyncIconButtonProps
>(({ onClick, disabled = false, loading = false, ...props }, ref) => {
  const { loading: pending, handleClick } = useAsyncClick(
    onClick,
    disabled || loading,
  );

  return (
    <IconButton
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      loading={loading || pending}
      {...props}
    />
  );
});

AsyncIconButton.displayName = "AsyncIconButton";

export { AsyncIconButton };
