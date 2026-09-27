import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { PopoverArrow } from "./PopoverArrow";
import { PopoverContent } from "./PopoverContent";

export type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root>;

/* Собственная обёртка: навешивать compound-части на экспорт Radix нельзя —
   это мутировало бы модуль, которым пользуются и другие компоненты. */
const Popover = (props: PopoverProps) => <PopoverPrimitive.Root {...props} />;

Popover.displayName = "Popover";
Popover.Trigger = PopoverPrimitive.Trigger;
Popover.Portal = PopoverPrimitive.Portal;
Popover.Close = PopoverPrimitive.Close;
Popover.Anchor = PopoverPrimitive.Anchor;
Popover.Arrow = PopoverArrow;
Popover.Content = PopoverContent;

export { Popover };
