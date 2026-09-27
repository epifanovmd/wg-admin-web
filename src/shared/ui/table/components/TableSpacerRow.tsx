import * as React from "react";

export interface TableSpacerRowProps {
  colSpan: number;
  height: number;
  /** Место распорки — для отладки и тестов (`data-virtual-spacer`). */
  placement: "top" | "bottom" | "parity";
}

const SPACER_CELL_CLASS = "border-0 p-0";

/** Пустая строка, держащая высоту невидимых строк при виртуализации. */
export const TableSpacerRow = ({
  colSpan,
  height,
  placement,
}: TableSpacerRowProps) => {
  const style = React.useMemo<React.CSSProperties>(
    () => ({ height }),
    [height],
  );

  return (
    <tr aria-hidden data-virtual-spacer={placement}>
      <td colSpan={colSpan} className={SPACER_CELL_CLASS} style={style} />
    </tr>
  );
};
