import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { DrawerDirectionContext } from "./drawer-context";

export type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

/**
 * Корень панели: пробрасывает `direction` в vaul и в контекст для
 * `DrawerContent`. Пропсы vaul — размеченное объединение (snap points), поэтому
 * они передаются целиком, без деструктуризации.
 */
export const DrawerRoot = (props: DrawerProps) => {
  const direction = props.direction ?? "bottom";

  return (
    <DrawerDirectionContext.Provider value={direction}>
      <DrawerPrimitive.Root {...props} direction={direction} />
    </DrawerDirectionContext.Provider>
  );
};
