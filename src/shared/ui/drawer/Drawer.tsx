import { Drawer as DrawerPrimitive } from "vaul";

import { DrawerBody } from "./components/DrawerBody";
import { DrawerContent } from "./components/DrawerContent";
import { DrawerDescription } from "./components/DrawerDescription";
import { DrawerFooter } from "./components/DrawerFooter";
import { DrawerHeader } from "./components/DrawerHeader";
import { DrawerRoot } from "./components/DrawerRoot";
import { DrawerTitle } from "./components/DrawerTitle";

export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerPrimitive.Trigger,
  Close: DrawerPrimitive.Close,
  Content: DrawerContent,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Title: DrawerTitle,
  Description: DrawerDescription,
});
