import { CollapseContent } from "./components/CollapseContent";
import { CollapseRoot } from "./components/CollapseRoot";
import { CollapseTrigger } from "./components/CollapseTrigger";

export const Collapse = Object.assign(CollapseRoot, {
  Trigger: CollapseTrigger,
  Content: CollapseContent,
});
