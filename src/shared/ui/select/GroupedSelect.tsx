import * as React from "react";

import { Select } from "./Select";
import type {
  GroupedSelectProps,
  SelectProps,
  SelectRef,
  SelectValue,
} from "./types";

/** Select со сгруппированными опциями: `groups` + плоский `options`. */
const GroupedSelectInner = <V extends SelectValue = string>(
  { groups, ...rest }: GroupedSelectProps<V>,
  ref: React.ForwardedRef<SelectRef>,
) => {
  const options = React.useMemo(
    () => groups.flatMap(group => group.options),
    [groups],
  );

  return (
    <Select<V>
      ref={ref}
      {...(rest as SelectProps<V>)}
      options={options}
      groups={groups}
    />
  );
};

const GroupedSelectForwarded = React.forwardRef(GroupedSelectInner);

GroupedSelectForwarded.displayName = "GroupedSelect";

export const GroupedSelect = GroupedSelectForwarded as <
  V extends SelectValue = string,
>(
  props: GroupedSelectProps<V> & { ref?: React.Ref<SelectRef> },
) => React.ReactElement;
